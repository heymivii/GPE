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

/** Geo data auto-filled from free, keyless sources (Open-Meteo geocoding + Wikipedia). */
export interface CityAutofillData {
  latitude: number | null;
  longitude: number | null;
  population: number | null;
  timezone: string | null;
  isCapital: boolean;
  imageUrl: string | null;
  matchedName: string | null;
}

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
   * Auto-fill a city's geo data from FREE keyless sources:
   *   - Open-Meteo geocoding → latitude, longitude, population, timezone, capital flag
   *     (feature_code 'PPLC' = country capital), matched against the country name;
   *   - Wikipedia (fr) page image → imageUrl.
   * Best-effort: any missing piece stays null; throws only when NOTHING matched.
   */
  async autofill(
    name: string,
    countryName?: string,
  ): Promise<CityAutofillData> {
    const norm = (s: string) =>
      s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

    const { data } = await axios.get<{
      results?: Array<{
        name: string;
        latitude: number;
        longitude: number;
        population?: number;
        timezone?: string;
        country?: string;
        feature_code?: string;
      }>;
    }>('https://geocoding-api.open-meteo.com/v1/search', {
      params: { name, count: 10, language: 'fr', format: 'json' },
      timeout: 10000,
    });

    const results = data.results ?? [];
    const match =
      (countryName &&
        results.find((r) => norm(r.country ?? '') === norm(countryName))) ||
      results[0];
    if (!match) {
      throw new NotFoundException(
        `Aucune donnée géographique trouvée pour « ${name} »`,
      );
    }

    // Wikipedia page image (best-effort — many cities have one, some don't).
    let imageUrl: string | null = null;
    try {
      const wiki = await axios.get<{
        query?: { pages?: Record<string, { thumbnail?: { source?: string } }> };
      }>('https://fr.wikipedia.org/w/api.php', {
        params: {
          action: 'query',
          titles: match.name,
          prop: 'pageimages',
          format: 'json',
          pithumbsize: 1200,
          redirects: 1,
        },
        timeout: 8000,
        headers: { 'User-Agent': 'SkyWalk/1.0 (school project)' },
      });
      const pages = wiki.data.query?.pages ?? {};
      imageUrl = Object.values(pages)[0]?.thumbnail?.source ?? null;
    } catch {
      // image is a nice-to-have — never fail the autofill for it
    }

    return {
      latitude: match.latitude ?? null,
      longitude: match.longitude ?? null,
      population: match.population ?? null,
      timezone: match.timezone ?? null,
      isCapital: match.feature_code === 'PPLC',
      imageUrl,
      matchedName: match.name ?? null,
    };
  }

  /**
   * Every addition starts as 'pending_review' (invisible user-side) and is traced to its
   * author; the other admins get notified so ONE OF THEM verifies and publishes it.
   */
  async create(
    createCityDto: CreateCityDto,
    creatorId?: number,
  ): Promise<City> {
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

    await this.ensureUniqueCityName(
      createCityDto.countryId,
      createCityDto.name,
    );

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
    });
    const saved = await this.cityRepository.save(city);
    await this.review.notifyAdminsOfPending(
      `Ville « ${saved.name} »`,
      creatorId,
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
      relations: ['country', 'createdBy', 'reviewedBy'],
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
    const nextName = updateCityDto.name ?? city.name;
    const nextCountryId = updateCityDto.countryId ?? city.countryId;

    await this.ensureUniqueCityName(nextCountryId, nextName, id);

    Object.assign(city, updateCityDto);
    return await this.cityRepository.save(city);
  }

  async remove(id: number): Promise<void> {
    await this.cityRepository.manager.transaction(async (manager) => {
      await manager.query('DELETE FROM "cost_of_living_cache" WHERE "city_id" = $1', [id]);
      await manager.query('DELETE FROM "cost_of_living" WHERE "city_id" = $1', [id]);
      await manager.query('DELETE FROM "job_offer" WHERE "city_id" = $1', [id]);
      await manager.query('DELETE FROM "city_comparison" WHERE "city_id" = $1', [id]);
      await manager.query(
        'DELETE FROM "expatriation_project" WHERE "destination_city_id" = $1',
        [id],
      );
      await manager.query('DELETE FROM "city" WHERE "id_city" = $1', [id]);
    });
  }
}
