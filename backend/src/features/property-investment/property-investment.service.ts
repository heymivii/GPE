import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PropertyInvestmentCityCache } from './entities/property-investment-city-cache.entity';
import { City } from '../city/entities/city.entity';
import { numbeoCitySlug } from '../../services/numbeo-slug.util';
import {
  fetchPropertyInvestmentHtml,
  fetchCityPropertyInvestmentHtml,
  parsePropertyInvestment,
  PropertyInvestmentData,
} from './numbeo-property-parser';

export interface PropertyInvestmentResult extends PropertyInvestmentData {
  country: string;
  source: string;
  sourceUrl: string;
  capturedAt: string;
}

export interface CityPropertyInvestmentResult extends PropertyInvestmentData {
  cityId: number;
  city: string;
  source: string;
  sourceUrl: string;
  capturedAt: string;
}

interface CacheEntry {
  data: PropertyInvestmentResult;
  expiresAt: number;
}

@Injectable()
export class PropertyInvestmentService {
  private readonly logger = new Logger(PropertyInvestmentService.name);
  private readonly TTL_MS = 24 * 60 * 60 * 1000; // 24h — Numbeo updates slowly.
  private readonly CITY_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days (DB-backed)
  private readonly cache = new Map<string, CacheEntry>();

  constructor(
    @InjectRepository(PropertyInvestmentCityCache)
    private readonly cityRepo: Repository<PropertyInvestmentCityCache>,
    @InjectRepository(City)
    private readonly cities: Repository<City>,
  ) {}

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

  async getByCountry(input: string): Promise<PropertyInvestmentResult> {
    const country = this.ALLOWED.get((input || '').toLowerCase().trim());
    if (!country) {
      throw new HttpException(
        `Country '${input}' is not supported. Allowed: France, USA, Japan, Switzerland.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const cached = this.cache.get(country);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    let html: string;
    try {
      html = await fetchPropertyInvestmentHtml(country);
    } catch (e) {
      this.logger.error(
        `Numbeo property-investment fetch failed for "${country}": ${e}`,
      );
      throw new HttpException(
        `Could not fetch Numbeo property data for "${country}".`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const parsed = parsePropertyInvestment(html);
    const result: PropertyInvestmentResult = {
      ...parsed,
      country,
      source: 'Numbeo',
      sourceUrl: `https://www.numbeo.com/property-investment/country_result.jsp?country=${encodeURIComponent(country)}`,
      capturedAt: new Date().toISOString().slice(0, 10),
    };

    this.cache.set(country, {
      data: result,
      expiresAt: Date.now() + this.TTL_MS,
    });
    this.logger.log(`🏠 Property investment cached for ${country}`);
    return result;
  }

  /**
   * CITY-level indicators from /property-investment/in/<slug> (same row format as the
   * country page). DB-cached 30 days per city; `refresh` forces a re-fetch (admin button);
   * `slugOverride` handles cities whose DB name differs from Numbeo's English slug.
   */
  async getByCity(
    cityId: number,
    opts: { refresh?: boolean; slugOverride?: string } = {},
  ): Promise<CityPropertyInvestmentResult> {
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
      html = await fetchCityPropertyInvestmentHtml(slug);
    } catch (e) {
      this.logger.error(
        `Numbeo city property fetch failed for "${slug}": ${e}`,
      );
      throw new HttpException(
        `Could not fetch Numbeo property data for city slug "${slug}". Check the Numbeo slug.`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data = parsePropertyInvestment(html);
    // Never store an all-empty payload (wrong slug / city with too little data).
    if (Object.values(data).every((v) => v == null)) {
      throw new HttpException(
        `No usable property indicators parsed for "${slug}" — likely a wrong Numbeo slug or a city with too little data.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const entity = cached ?? this.cityRepo.create({ cityId });
    entity.data = data as unknown as Record<string, number | null>;
    entity.source = 'Numbeo'; // a re-fetch replaces any manual edit (by design)
    entity.cachedAt = new Date();
    entity.expiresAt = new Date(Date.now() + this.CITY_TTL_MS);
    const saved = await this.cityRepo.save(entity);

    this.logger.log(
      `🏙️ Property investment cached for city ${city.name} (#${cityId})`,
    );
    return this.toCityResult(saved, city.name);
  }

  /**
   * Manual admin edit: merge the provided fields (null clears a value) into the cached
   * payload and mark the row 'manuel'. A later Numbeo re-fetch replaces it (by design).
   */
  async updateCity(
    cityId: number,
    patch: Partial<Record<keyof PropertyInvestmentData, number | null>>,
  ): Promise<CityPropertyInvestmentResult> {
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
    entity.expiresAt = new Date(Date.now() + this.CITY_TTL_MS);
    const saved = await this.cityRepo.save(entity);
    this.logger.log(
      `✏️ Property investment manually edited for city ${city.name} (#${cityId})`,
    );
    return this.toCityResult(saved, city.name);
  }

  /** Cache-only read for display (no outbound fetch): null when nothing cached yet. */
  async getCachedCity(
    cityId: number,
  ): Promise<CityPropertyInvestmentResult | null> {
    const cached = await this.cityRepo.findOne({
      where: { cityId },
      relations: ['city'],
    });
    return cached ? this.toCityResult(cached, cached.city?.name ?? '') : null;
  }

  private toCityResult(
    entity: PropertyInvestmentCityCache,
    cityName: string,
  ): CityPropertyInvestmentResult {
    return {
      ...(entity.data as unknown as PropertyInvestmentData),
      cityId: entity.cityId,
      city: cityName,
      source: entity.source ?? 'Numbeo',
      sourceUrl: `https://www.numbeo.com/property-investment/in/${numbeoCitySlug(cityName)}`,
      capturedAt: entity.cachedAt.toISOString().slice(0, 10),
    };
  }
}
