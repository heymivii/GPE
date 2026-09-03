import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QualityOfLifeCache } from './entities/quality-of-life-cache.entity';
import { QualityOfLifeCityCache } from './entities/quality-of-life-city-cache.entity';
import { City } from '../city/entities/city.entity';
import { numbeoCitySlug } from '../../services/numbeo-slug.util';
import {
  NumbeoBlockedError,
  NumbeoUnknownSlugError,
} from '../../services/numbeo-fetch.util';
import {
  fetchQualityOfLifeHtml,
  fetchCityQualityOfLifeHtml,
  parseQualityOfLife,
  parseLastUpdate,
  QualityOfLifeData,
} from './numbeo-quality-parser';

export interface QualityOfLifeResult extends QualityOfLifeData {
  country: string;
  source: string;
  sourceUrl: string;
  sourceLastUpdate?: string;
  capturedAt: string;
}

export interface CityQualityOfLifeResult extends QualityOfLifeData {
  cityId: number;
  city: string;
  source: string;
  sourceUrl: string;
  sourceLastUpdate?: string;
  capturedAt: string;
}

@Injectable()
export class QualityOfLifeService {
  private readonly logger = new Logger(QualityOfLifeService.name);
  private readonly TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days — Numbeo updates slowly.

  // alias / ISO2 code -> Numbeo English country name (supported destinations only).
  private readonly ALLOWED = new Map<string, string>([
    ['france', 'France'],
    ['fr', 'France'],
    ['united states', 'United States'],
    ['usa', 'United States'],
    ['us', 'United States'],
    ['etats-unis', 'United States'],
    ['japan', 'Japan'],
    ['jp', 'Japan'],
    ['japon', 'Japan'],
    ['switzerland', 'Switzerland'],
    ['ch', 'Switzerland'],
    ['suisse', 'Switzerland'],
  ]);

  constructor(
    @InjectRepository(QualityOfLifeCache)
    private readonly repo: Repository<QualityOfLifeCache>,
    @InjectRepository(QualityOfLifeCityCache)
    private readonly cityRepo: Repository<QualityOfLifeCityCache>,
    @InjectRepository(City)
    private readonly cities: Repository<City>,
  ) {}

  /**
   * CITY-level indices from /quality-of-life/in/<slug> (same labels as the country page).
   * Cached 30 days per city; `refresh` forces a re-fetch (admin button). `slugOverride`
   * handles cities whose DB name differs from Numbeo's English slug (Genève → Geneva).
   */
  async getByCity(
    cityId: number,
    opts: { refresh?: boolean; slugOverride?: string } = {},
  ): Promise<CityQualityOfLifeResult> {
    const city = await this.cities.findOne({ where: { idCity: cityId } });
    if (!city) {
      throw new NotFoundException(`Ville ${cityId} introuvable`);
    }

    const cached = await this.cityRepo.findOne({ where: { cityId } });
    if (cached && cached.expiresAt > new Date() && !opts.refresh) {
      return this.toCityResult(cached, city.name);
    }

    const slug = (
      opts.slugOverride?.trim() || numbeoCitySlug(city.name)
    ).replace(/\s+/g, '-');
    let html: string;
    try {
      html = await fetchCityQualityOfLifeHtml(slug);
    } catch (e) {
      this.logger.error(
        `Numbeo city quality-of-life fetch failed for "${slug}": ${e}`,
      );
      throw new HttpException(
        (e instanceof NumbeoBlockedError || e instanceof NumbeoUnknownSlugError ? e.message : `Could not fetch Numbeo quality-of-life for city slug "${slug}".`),
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data = parseQualityOfLife(html);
    // Same guard as cost-of-living: never store an all-empty payload (wrong slug / sparse city).
    if (Object.values(data).every((v) => v == null)) {
      throw new HttpException(
        `No usable quality-of-life indices parsed for "${slug}" — likely a wrong Numbeo slug or a city with too little data.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const entity = cached ?? this.cityRepo.create({ cityId });
    entity.data = data as unknown as Record<string, number | null>;
    entity.source = 'Numbeo'; // a re-fetch replaces any manual edit (by design)
    entity.sourceLastUpdate = parseLastUpdate(html);
    entity.cachedAt = new Date();
    entity.expiresAt = new Date(Date.now() + this.TTL_MS);
    const saved = await this.cityRepo.save(entity);

    this.logger.log(
      `🏙️ Quality of life cached for city ${city.name} (#${cityId})`,
    );
    return this.toCityResult(saved, city.name);
  }

  /** Cache-only read for display (no outbound fetch): null when nothing cached yet. */
  async getCachedCity(cityId: number): Promise<CityQualityOfLifeResult | null> {
    const cached = await this.cityRepo.findOne({
      where: { cityId },
      relations: ['city'],
    });
    return cached ? this.toCityResult(cached, cached.city?.name ?? '') : null;
  }

  /**
   * Manual admin edit: merge the provided fields (null clears a value) into the cached
   * payload and mark the row 'manuel'. A later Numbeo re-fetch replaces it (by design).
   */
  async updateCity(
    cityId: number,
    patch: Partial<Record<keyof QualityOfLifeData, number | null>>,
  ): Promise<CityQualityOfLifeResult> {
    const city = await this.cities.findOne({ where: { idCity: cityId } });
    if (!city) {
      throw new NotFoundException(`Ville ${cityId} introuvable`);
    }
    const entity =
      (await this.cityRepo.findOne({ where: { cityId } })) ??
      this.cityRepo.create({ cityId, data: {} });
    const defined = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined),
    );
    entity.data = { ...(entity.data ?? {}), ...defined };
    entity.source = 'manuel';
    entity.cachedAt = new Date();
    entity.expiresAt = new Date(Date.now() + this.TTL_MS);
    const saved = await this.cityRepo.save(entity);
    this.logger.log(
      `✏️ Quality of life manually edited for city ${city.name} (#${cityId})`,
    );
    return this.toCityResult(saved, city.name);
  }

  private toCityResult(
    entity: QualityOfLifeCityCache,
    cityName: string,
  ): CityQualityOfLifeResult {
    return {
      ...(entity.data as unknown as QualityOfLifeData),
      cityId: entity.cityId,
      city: cityName,
      source: entity.source ?? 'Numbeo',
      sourceUrl: `https://www.numbeo.com/quality-of-life/in/${numbeoCitySlug(cityName)}`,
      sourceLastUpdate: entity.sourceLastUpdate,
      capturedAt: entity.cachedAt.toISOString().slice(0, 10),
    };
  }

  async getByCountry(input: string): Promise<QualityOfLifeResult> {
    const country = this.ALLOWED.get((input || '').toLowerCase().trim());
    if (!country) {
      throw new HttpException(
        `Country '${input}' is not supported. Allowed: France, USA, Japan, Switzerland.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const cached = await this.repo.findOne({ where: { country } });
    if (cached && cached.expiresAt > new Date()) {
      return this.toResult(cached);
    }

    let html: string;
    try {
      html = await fetchQualityOfLifeHtml(country);
    } catch (e) {
      this.logger.error(
        `Numbeo quality-of-life fetch failed for "${country}": ${e}`,
      );
      throw new HttpException(
        (e instanceof NumbeoBlockedError || e instanceof NumbeoUnknownSlugError ? e.message : `Could not fetch Numbeo quality-of-life data for "${country}".`),
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data = parseQualityOfLife(html);
    const entity = cached ?? this.repo.create({ country });
    entity.data = data as unknown as Record<string, number | null>;
    entity.sourceLastUpdate = parseLastUpdate(html);
    entity.cachedAt = new Date();
    entity.expiresAt = new Date(Date.now() + this.TTL_MS);
    const saved = await this.repo.save(entity);

    this.logger.log(`🌍 Quality of life cached for ${country}`);
    return this.toResult(saved);
  }

  private toResult(entity: QualityOfLifeCache): QualityOfLifeResult {
    return {
      ...(entity.data as unknown as QualityOfLifeData),
      country: entity.country,
      source: 'Numbeo',
      sourceUrl: `https://www.numbeo.com/quality-of-life/country_result.jsp?country=${encodeURIComponent(entity.country)}`,
      sourceLastUpdate: entity.sourceLastUpdate,
      capturedAt: entity.cachedAt.toISOString().slice(0, 10),
    };
  }
}
