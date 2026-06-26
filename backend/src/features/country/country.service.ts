import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country, ContentReviewStatus } from './entities/country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import restCountriesService from '../../services/restCountries.service';
import { ReviewService } from '../review/review.service';
import { User } from '../user/entities/user.entity';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    private readonly review: ReviewService,
  ) {}

  /**
   * Every addition starts as 'pending_review' (invisible user-side) and is traced to its
   * author; the other admins get notified so ONE OF THEM verifies and publishes it.
   */
  async create(createDto: CreateCountryDto, creatorId?: number): Promise<Country> {
    const country = this.countryRepository.create({
      ...createDto,
      status: 'pending_review',
      createdById: creatorId ?? null,
    });
    const saved = await this.countryRepository.save(country);
    await this.review.notifyAdminsOfPending(`Pays « ${saved.countryName} »`, creatorId);
    return saved;
  }

  /** Approve/reject a pending country — the reviewer must NOT be its author (4 eyes). */
  async reviewCountry(id: number, reviewerId: number, approve: boolean): Promise<Country> {
    const country = await this.findOne(id);
    this.review.assertNotSelfReview(country.createdById, reviewerId);
    if (country.status !== 'pending_review') {
      throw new BadRequestException(
        `Ce pays n'est pas en attente de vérification (statut actuel : ${country.status}).`,
      );
    }
    country.status = approve ? 'active' : 'rejected';
    country.reviewedById = reviewerId;
    country.reviewedAt = new Date();
    const saved = await this.countryRepository.save(country);
    await this.review.notifyAuthorOfDecision(
      `Pays « ${saved.countryName} »`,
      saved.createdById,
      approve,
      reviewerId,
    );
    return saved;
  }

  async findAll(status?: string): Promise<Country[]> {
    const countries = await this.countryRepository.find({
      relations: ['continent', 'createdBy', 'reviewedBy'],
      ...(status !== undefined && { where: { status: status as ContentReviewStatus } }),
    });
    // NEVER serialize full User rows (password hash!) — keep display fields only.
    return countries.map((c) => this.sanitizeReviewers(c));
  }

  private sanitizeReviewers(country: Country): Country {
    const strip = (u?: User | null): User | null | undefined =>
      u
        ? ({ idUser: u.idUser, firstName: u.firstName, lastName: u.lastName } as unknown as User)
        : u;
    country.createdBy = strip(country.createdBy);
    country.reviewedBy = strip(country.reviewedBy);
    return country;
  }

  // Reference list of all ~250 countries (name + ISO + region + flag) for admin pickers.
  getAvailableCountries() {
    return restCountriesService.getAllCountries();
  }

  async findOne(id: number): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { idCountry: id },
      relations: ['continent'],
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return country;
  }

  async update(id: number, updateDto: UpdateCountryDto): Promise<Country> {
    const country = await this.findOne(id);
    Object.assign(country, updateDto);
    return await this.countryRepository.save(country);
  }

  async remove(id: number): Promise<void> {
    const country = await this.findOne(id);
    await this.countryRepository.remove(country);
  }
}
