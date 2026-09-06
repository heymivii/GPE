import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { City } from './entities/city.entity';
import {
  ContentReviewStatus,
  Country,
} from '../country/entities/country.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import restCountriesService from '../../services/restCountries.service';
import { ReviewService } from '../review/review.service';
import { User } from '../user/entities/user.entity';
import { fetchCityAutofill, type CityAutofillData } from './city-autofill';

/** Geo data auto-filled from free, keyless sources (Open-Meteo geocoding + Wikipedia). */
// Ré-exportée pour ne pas casser les imports existants.
export type { CityAutofillData } from './city-autofill';

@Injectable()
export class CityService {
  private readonly logger = new Logger(CityService.name);

  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    private readonly review: ReviewService,
  ) {}

  private normalizeCityName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();
  }

  private async ensureUniqueCityName(
    countryId: number,
    name: string,
    excludeCityId?: number,
  ): Promise<void> {
    const normalizedName = this.normalizeCityName(name);
    const cities = await this.findByCountry(countryId);
    const duplicate = cities.find(
      (city) =>
        city.idCity !== excludeCityId &&
        this.normalizeCityName(city.name) === normalizedName,
    );

    if (duplicate) {
      throw new ConflictException(
        `Une ville nommée « ${name} » existe déjà pour ce pays.`,
      );
    }
  }

  /**
   * Auto-fill a city's geo data from FREE keyless sources (voir city-autofill.ts).
   * La logique vit dans un module autonome pour être réutilisable hors contexte
   * Nest — le script de rattrapage des villes existantes s'en sert aussi.
   */
  async autofill(
    name: string,
    countryName?: string,
  ): Promise<CityAutofillData> {
    return fetchCityAutofill(name, countryName);
  }

  /**
   * Every addition starts as 'pending_review' (invisible user-side) and is traced to its
   * author; the other admins get notified so ONE OF THEM verifies and publishes it.
   */
  async create(
    createCityDto: CreateCityDto,
    creatorId?: number,
  ): Promise<City> {
    // Cheap validations FIRST — reject before spending any external autofill call.
    if (
      createCityDto.assignedToId != null &&
      creatorId != null &&
      createCityDto.assignedToId === creatorId
    ) {
      throw new BadRequestException(
        'Vous ne pouvez pas vous assigner votre propre vérification.',
      );
    }
    await this.ensureUniqueCityName(
      createCityDto.countryId,
      createCityDto.name,
    );

    // AUTO-FILL: complete any missing geo field from free sources (Open-Meteo + Wikipedia).
    // Best-effort — creation must NEVER fail because an external geo API is down.
    let auto: CityAutofillData | null = null;
    const needsAutofill =
      createCityDto.latitude == null ||
      createCityDto.longitude == null ||
      createCityDto.population == null ||
      !createCityDto.timezone ||
      !createCityDto.imageUrl;
    if (needsAutofill) {
      try {
        const country = await this.cityRepository.manager.findOne(Country, {
          where: { idCountry: createCityDto.countryId },
        });
        auto = await this.autofill(createCityDto.name, country?.countryName);
      } catch (e) {
        this.logger.warn(
          `Autofill failed for "${createCityDto.name}" — creating with provided fields only: ${(e as Error)?.message}`,
        );
      }
    }

    const city = this.cityRepository.create({
      name: createCityDto.name,
      latitude: (createCityDto.latitude ?? auto?.latitude)?.toString(),
      longitude: (createCityDto.longitude ?? auto?.longitude)?.toString(),
      population: createCityDto.population ?? auto?.population ?? undefined,
      timezone: createCityDto.timezone || auto?.timezone || undefined,
      isCapital: createCityDto.isCapital ?? auto?.isCapital ?? false,
      imageUrl: createCityDto.imageUrl || auto?.imageUrl || undefined,
      status: 'pending_review',
      countryId: createCityDto.countryId,
      createdById: creatorId ?? null,
      assignedToId: createCityDto.assignedToId ?? null,
    });
    const saved = await this.cityRepository.save(city);
    if (saved.assignedToId) {
      await this.review.notifyUser(
        saved.assignedToId,
        `🔍 Ville « ${saved.name} » vous a été assignée pour vérification par ${await this.review.nameOf(creatorId)}.`,
        'alert',
      );
    } else {
      await this.review.notifyAdminsOfPending(
        `Ville « ${saved.name} »`,
        creatorId,
      );
    }
    return saved;
  }

  /** Step 1 — the ASSIGNED reviewer marks the check done; the creator then does the final call. */
  async markReviewDone(id: number, userId: number): Promise<City> {
    const city = await this.findOne(id);
    if (city.status !== 'pending_review') {
      throw new BadRequestException(
        `Cette ville n'est pas en attente de vérification (statut : ${city.status}).`,
      );
    }
    if (city.assignedToId == null) {
      throw new BadRequestException(
        "Cette ville n'a pas de vérificateur assigné — utilisez le circuit de validation classique.",
      );
    }
    if (city.assignedToId !== userId) {
      throw new BadRequestException(
        'Cette vérification est assignée à un autre admin.',
      );
    }
    if (city.createdById != null && city.createdById === userId) {
      throw new BadRequestException(
        "L'auteur de la ville ne peut pas effectuer lui-même la vérification assignée.",
      );
    }
    city.status = 'review_done';
    city.reviewedById = userId;
    city.reviewedAt = new Date();
    const saved = await this.cityRepository.save(city);
    await this.review.notifyUser(
      saved.createdById,
      `✅ Ville « ${saved.name} » vérifiée par ${await this.review.nameOf(userId)} — à vous de la valider (publier ou renvoyer).`,
      'alert',
    );
    return saved;
  }

  /** Approve/reject a pending city — the reviewer must NOT be its author (4 eyes). */
  async reviewCity(
    id: number,
    reviewerId: number,
    approve: boolean,
  ): Promise<City> {
    const city = await this.findOne(id);
    if (city.assignedToId) {
      // Assigned flow: FINAL call happens on 'review_done' (typically by the creator).
      if (city.reviewedById != null && reviewerId === city.reviewedById) {
        throw new BadRequestException(
          'La validation finale doit être faite par un autre admin que celui qui a effectué la vérification.',
        );
      }
      if (reviewerId === city.assignedToId) {
        throw new BadRequestException(
          "La validation finale doit être faite par un autre admin que le vérificateur assigné (typiquement l'auteur).",
        );
      }
      if (city.status !== 'review_done') {
        throw new BadRequestException(
          `Validation finale impossible : la vérification assignée n'est pas terminée (statut : ${city.status}).`,
        );
      }
      if (approve) {
        city.status = 'active';
      } else {
        city.status = 'pending_review'; // back to the assignee for another review
      }
      const saved = await this.cityRepository.save(city);
      const finalizer = await this.review.nameOf(reviewerId);
      // Notify the assigned reviewer…
      await this.review.notifyUser(
        saved.assignedToId,
        approve
          ? `✅ Ville « ${saved.name} » validée et publiée par ${finalizer}.`
          : `🔁 Ville « ${saved.name} » renvoyée par ${finalizer} — merci de refaire une review.`,
        approve ? 'info' : 'alert',
      );
      // …and the author (may be a third admin doing the final call — the author must know too).
      if (saved.createdById && saved.createdById !== saved.assignedToId) {
        await this.review.notifyUser(
          saved.createdById,
          approve
            ? `✅ Votre ville « ${saved.name} » a été publiée par ${finalizer}.`
            : `🔁 Votre ville « ${saved.name} » a été renvoyée en review par ${finalizer}.`,
          'info',
        );
      }
      return saved;
    }
    // Legacy 4-eyes flow (no assignee)
    this.review.assertNotSelfReview(city.createdById, reviewerId);
    if (city.status !== 'pending_review') {
      throw new BadRequestException(
        `Cette ville n'est pas en attente de vérification (statut actuel : ${city.status}).`,
      );
    }
    city.status = approve ? 'active' : 'rejected';
    city.reviewedById = reviewerId;
    city.reviewedAt = new Date();
    const saved = await this.cityRepository.save(city);
    await this.review.notifyAuthorOfDecision(
      `Ville « ${saved.name} »`,
      saved.createdById,
      approve,
      reviewerId,
    );
    return saved;
  }

  async findAll(status?: string): Promise<City[]> {
    const cities = await this.cityRepository.find({
      relations: ['country', 'createdBy', 'reviewedBy', 'assignedTo'],
      ...(status !== undefined && {
        where: { status: status as ContentReviewStatus },
      }),
    });
    // NEVER serialize full User rows (password hash!) — keep display fields only.
    return cities.map((c) => this.sanitizeReviewers(c));
  }

  private sanitizeReviewers(city: City): City {
    const strip = (u?: User | null): User | null | undefined =>
      u
        ? ({
            idUser: u.idUser,
            firstName: u.firstName,
            lastName: u.lastName,
          } as unknown as User)
        : u;
    city.createdBy = strip(city.createdBy);
    city.reviewedBy = strip(city.reviewedBy);
    city.assignedTo = strip(city.assignedTo);
    return city;
  }

  // Reference list of cities of a country (free, no key — via countriesnow), for admin pickers.
  async getAvailableCities(country: string): Promise<string[]> {
    if (!country) {
      return [];
    }
    return restCountriesService.getCitiesByCountry(country);
  }

  async findByCountry(countryId: number, status?: string): Promise<City[]> {
    return await this.cityRepository.find({
      where: {
        countryId,
        ...(status !== undefined && {
          status: status as 'active' | 'archived',
        }),
      },
    });
  }

  async findOne(id: number): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { idCity: id },
      relations: ['country'],
    });
    if (!city) {
      throw new NotFoundException(`Ville avec l'ID ${id} introuvable`);
    }
    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto): Promise<City> {
    const city = await this.findOne(id);

    // Guard: the review workflow OWNS status transitions. A generic update may only
    // archive/unarchive an ALREADY-decided city — never publish one still in review
    // (that must go through markReviewDone/reviewCity).
    if (updateCityDto.status !== undefined) {
      if (city.status === 'pending_review' || city.status === 'review_done') {
        throw new BadRequestException(
          "Le statut d'une ville en cours de vérification se change via les actions de validation, pas par une modification.",
        );
      }
      if (
        updateCityDto.status !== 'active' &&
        updateCityDto.status !== 'archived'
      ) {
        throw new BadRequestException(
          `Statut invalide pour une modification : ${updateCityDto.status}`,
        );
      }
    }

    const nextName = updateCityDto.name ?? city.name;
    const nextCountryId = updateCityDto.countryId ?? city.countryId;

    await this.ensureUniqueCityName(nextCountryId, nextName, id);

    Object.assign(city, updateCityDto);
    return await this.cityRepository.save(city);
  }

  async remove(id: number): Promise<void> {
    await this.cityRepository.manager.transaction(async (manager) => {
      await manager.query(
        'DELETE FROM "cost_of_living_cache" WHERE "city_id" = $1',
        [id],
      );
      await manager.query('DELETE FROM "cost_of_living" WHERE "city_id" = $1', [
        id,
      ]);
      await manager.query('DELETE FROM "job_offer" WHERE "city_id" = $1', [id]);
      await manager.query(
        'DELETE FROM "city_comparison" WHERE "city_id" = $1',
        [id],
      );
      await manager.query(
        'DELETE FROM "expatriation_project" WHERE "destination_city_id" = $1',
        [id],
      );
      await manager.query('DELETE FROM "city" WHERE "id_city" = $1', [id]);
    });
  }
}
