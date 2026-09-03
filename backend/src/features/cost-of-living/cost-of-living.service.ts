import {
  Injectable,
  Logger,
  HttpException,
  HttpStatus,
  Optional,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import axios from 'axios';
import {
  NumbeoBlockedError,
  NumbeoUnknownSlugError,
} from '../../services/numbeo-fetch.util';
import { CostOfLivingCleanerService } from './cost-of-living-cleaner.service';
import { CostOfLivingCache } from './entities/cost-of-living-cache.entity';
import { City } from '../city/entities/city.entity';
import { Country } from '../country/entities/country.entity';
import { QualityOfLifeService } from '../quality-of-life/quality-of-life.service';
import { PropertyInvestmentService } from '../property-investment/property-investment.service';
import { CleanedCostOfLivingData } from './types/cost-of-living.types';
import {
  fetchNumbeoHtml,
  parseNumbeo,
  CityRef,
  CuratedData,
} from './numbeo-parser';

@Injectable()
export class CostOfLivingService {
  private readonly logger = new Logger(CostOfLivingService.name);
  private readonly RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  private readonly RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
  private readonly BASE_URL = `https://${process.env.RAPIDAPI_HOST}`;

  private readonly CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

  // Curated (admin/Numbeo) entries are the source of truth, not a live-API cache →
  // long expiry so the runtime never re-fetches the stale external API for them.
  private readonly CURATED_TTL_MS = 10 * 365 * 24 * 60 * 60 * 1000;

  private readonly CURRENCY_BY_COUNTRY: Record<string, string> = {
    France: 'EUR',
    'United States': 'USD',
    Japan: 'JPY',
    Switzerland: 'CHF',
  };

  private readonly memCache = new Map<
    string,
    { data: CleanedCostOfLivingData; expiresAt: number }
  >();
  private readonly MEM_TTL_MS = 6 * 60 * 60 * 1000;

  private readonly ALLOWED_COUNTRIES = new Map<string, string>([
    ['france', 'France'],
    ['fr', 'France'],
    ['usa', 'United States'],
    ['united states', 'United States'],
    ['etats-unis', 'United States'],
    ['us', 'United States'],
    ['japan', 'Japan'],
    ['japon', 'Japan'],
    ['jp', 'Japan'],
    ['switzerland', 'Switzerland'],
    ['ch', 'Switzerland'],
    ['suisse', 'Switzerland'],
  ]);

  constructor(
    private readonly cleanerService: CostOfLivingCleanerService,
    @InjectRepository(CostOfLivingCache)
    private readonly cacheRepository: Repository<CostOfLivingCache>,
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    // Optional: auto-chained city indices (QoL + property) after a cost-of-living fetch.
    // @Optional() : sans ça Nest les traite comme requis (et casse les tests / tout
    // module qui ne les fournit pas), alors que le service garde déjà en `?.`.
    @Optional() private readonly qualityOfLife?: QualityOfLifeService,
    @Optional() private readonly propertyInvestment?: PropertyInvestmentService,
  ) {}

  private memKey(city: string, country: string): string {
    return `${city.toLowerCase().trim()}::${country.toLowerCase().trim()}`;
  }

  private memGet(key: string): CleanedCostOfLivingData | null {
    const e = this.memCache.get(key);
    if (e && e.expiresAt > Date.now()) {
      this.logger.log(`⚡ Memory cache HIT → ${key}`);
      return e.data;
    }
    if (e) this.memCache.delete(key);
    return null;
  }

  private memSet(key: string, data: CleanedCostOfLivingData): void {
    this.memCache.set(key, { data, expiresAt: Date.now() + this.MEM_TTL_MS });
  }

  async getCostOfLiving(city: string, country: string) {
    const normalizedCountry = this.validateCountry(country);
    if (!normalizedCountry) {
      throw new HttpException(
        `Country '${country}' is not allowed. Allowed: France, USA, Japan, Switzerland.`,
        HttpStatus.FORBIDDEN,
      );
    }

    const key = this.memKey(city, normalizedCountry);

    const mem = this.memGet(key);
    if (mem) return mem;

    const cityEntity = await this.cityRepository
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.country', 'co')
      .where('LOWER(c.name) = LOWER(:cityName)', { cityName: city.trim() })
      .andWhere('LOWER(co.name) = LOWER(:countryName)', {
        countryName: normalizedCountry,
      })
      .getOne();

    if (cityEntity) {
      const cached = await this.cacheRepository.findOne({
        where: { cityId: cityEntity.idCity },
      });

      if (cached && new Date(cached.expiresAt) > new Date()) {
        this.logger.log(
          `📦 DB cache HIT (by cityId) → ${city}, ${normalizedCountry}`,
        );
        const result = cached.data as CleanedCostOfLivingData;
        this.memSet(key, result);
        return result;
      }
    }

    const cachedByJson = await this.cacheRepository
      .createQueryBuilder('cache')
      .where("LOWER(cache.data -> 'city' ->> 'name') = LOWER(:cityName)", {
        cityName: city.trim(),
      })
      .andWhere(
        "LOWER(cache.data -> 'city' ->> 'country') = LOWER(:countryName)",
        { countryName: normalizedCountry },
      )
      .andWhere('cache.expiresAt > NOW()')
      .getOne();

    if (cachedByJson) {
      this.logger.log(
        `📦 DB cache HIT (by JSON) → ${city}, ${normalizedCountry}`,
      );
      const result = cachedByJson.data as CleanedCostOfLivingData;
      this.memSet(key, result);
      return result;
    }

    if (!this.RAPIDAPI_KEY || !this.RAPIDAPI_HOST) {
      throw new HttpException(
        'No cached data and RapidAPI credentials not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    this.logger.warn(
      `⚠️  No DB cache for ${city}, ${normalizedCountry} — calling external API`,
    );
    const data = await this.fetchFromApi(city, normalizedCountry);
    this.memSet(key, data);

    // READ-ONLY path: this method is reachable UNAUTHENTICATED (GET /cost-of-living/search).
    // Persist the cache ONLY for a city that already exists — NEVER create a City here, or
    // anyone could spawn published, unreviewed cities. City/country creation is reserved to
    // the admin-guarded fetchAndStoreCuratedCity path.
    if (cityEntity) {
      this.persistToDb(cityEntity.idCity, data).catch((e) =>
        this.logger.warn(`DB persist failed: ${e}`),
      );
    }

    return data;
  }

  async getCachedDataByCityId(
    cityId: number,
  ): Promise<CleanedCostOfLivingData | null> {
    this.logger.log(
      `🔍 getCachedDataByCityId called with cityId=${cityId} (type: ${typeof cityId})`,
    );
    const cached = await this.cacheRepository.findOne({ where: { cityId } });
    this.logger.log(
      `🔍 cached result: ${cached ? `found (idCache=${cached.idCache}, cityId=${cached.cityId}, expires=${cached.expiresAt})` : 'NOT FOUND'}`,
    );
    if (cached && new Date(cached.expiresAt) > new Date()) {
      return cached.data as CleanedCostOfLivingData;
    }
    this.logger.warn(`⚠️ DB Cache MISS for city_id=${cityId}`);
    return null;
  }

  async updateCostOfLiving(cityId: number, data: any): Promise<any> {
    await this.persistToDb(cityId, data);
    const cityEntity = await this.cityRepository.findOne({
      where: { idCity: cityId },
      relations: ['country'],
    });
    if (cityEntity && cityEntity.country) {
      const key = this.memKey(cityEntity.name, cityEntity.country.countryName);
      this.memCache.delete(key);
    }
    return data;
  }

  async fetchAndCache(
    cityId: number,
    cityName: string,
    countryName: string,
    forceRefresh = false,
  ): Promise<CleanedCostOfLivingData> {
    const key = this.memKey(cityName, countryName);

    if (!forceRefresh) {
      const mem = this.memGet(key);
      if (mem) return mem;
      const db = await this.getCachedDataByCityId(cityId);
      if (db) {
        this.memSet(key, db);
        return db;
      }
    }

    const cleanedData = await this.fetchFromApi(cityName, countryName);

    // Validate that cleaned data actually contains valid figures before caching
    const isInvalidData =
      !cleanedData.summary.averageSalary &&
      !cleanedData.categories.housing.rent.oneBedroom.cityCenter.avg;
    if (isInvalidData) {
      this.logger.warn(
        `Returned API data for ${cityName} is mostly empty/zeros. Not caching it.`,
      );
      return cleanedData; // return it but don't cache
    }

    await this.persistToDb(cityId, cleanedData);
    this.memSet(key, cleanedData);
    return cleanedData;
  }

  private async persistToDb(
    cityId: number,
    data: CleanedCostOfLivingData,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + this.CACHE_TTL_MS);
    const existing = await this.cacheRepository.findOne({ where: { cityId } });

    if (existing) {
      existing.data = data;
      existing.cachedAt = new Date();
      existing.expiresAt = expiresAt;
      await this.cacheRepository.save(existing);
    } else {
      await this.cacheRepository.save(
        this.cacheRepository.create({
          cityId,
          data,
          cachedAt: new Date(),
          expiresAt,
          city: { idCity: cityId } as any,
        }),
      );
    }
    this.logger.log(
      `💾 Persisted cost-of-living for city_id=${cityId} (expires ${expiresAt.toISOString()})`,
    );
  }

  private createEmptyCostOfLiving(
    cityName: string,
    countryName: string,
  ): CleanedCostOfLivingData {
    return {
      city: {
        id: 0,
        name: cityName,
        country: countryName,
      },
      currency: {
        code: 'EUR',
        exchangeRates: { EUR: 1 },
        lastUpdated: new Date().toISOString(),
      },
      categories: {
        housing: {
          rent: {
            oneBedroom: {
              cityCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' },
              outsideCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' },
            },
            threeBedroom: {
              cityCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' },
              outsideCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' },
            },
          },
          buy: {
            pricePerSqm: {
              cityCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' },
              outsideCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' },
            },
          },
        },
        food: { markets: {} as any },
        transportation: {
          publicTransport: {
            oneWayTicket: { min: 0, avg: 0, max: 0, currency: 'EUR' },
            monthlyPass: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          },
          taxi: {
            start: { min: 0, avg: 0, max: 0, currency: 'EUR' },
            per1km: { min: 0, avg: 0, max: 0, currency: 'EUR' },
            waitingHour: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          },
          personal: {
            gasoline1L: { min: 0, avg: 0, max: 0, currency: 'EUR' },
            newCar: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          },
        },
        utilities: {
          basic85m2: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          internet: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          mobileMinute: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        },
        restaurants: {
          inexpensiveMeal: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          midRangeMeal2People: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          mcMeal: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          cappuccino: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          cocaCola: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          domesticBeer: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          importedBeer: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        },
        clothing: {
          jeans: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          summerDress: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          runningShoes: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          leatherShoes: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        },
        childcare: {
          preschool: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          primarySchool: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        },
        sports: {
          cinema: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          gym: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          tennis: { min: 0, avg: 0, max: 0, currency: 'EUR' },
        },
        salary: {
          averageMonthly: { min: 0, avg: 0, max: 0, currency: 'EUR' },
          mortgageRate: { min: 0, avg: 0, max: 0 },
        },
      },
      summary: {
        monthlyBudget: { min: 0, avg: 0, max: 0 },
        averageSalary: 0,
      },
    };
  }

  // Admin-triggered: fetch a city's cost of living from Numbeo, parse it deterministically
  // (NO AI), and store it with a long expiry. Returns a small summary for the admin UI.
  async fetchAndStoreCuratedCity(input: {
    city: string;
    country: string;
    slug?: string;
  }): Promise<{
    cityId: number;
    city: string;
    country: string;
    currency: string;
    slug: string;
    pricedFields: number;
    rentAvg: number;
    unavailable: string[];
    summary: CleanedCostOfLivingData['summary'];
  }> {
    const country = this.validateCountry(input.country);
    if (!country) {
      throw new HttpException(
        `Country '${input.country}' is not allowed. Allowed: France, USA, Japan, Switzerland.`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const cityName = input.city?.trim();
    if (!cityName) {
      throw new HttpException('city is required', HttpStatus.BAD_REQUEST);
    }
    const currency = this.CURRENCY_BY_COUNTRY[country] ?? 'EUR';
    const slug = (input.slug?.trim() || cityName).replace(/\s+/g, '-');
    const ref: CityRef = { city: cityName, country, currency, slug };

    let html: string;
    try {
      html = await fetchNumbeoHtml(slug);
    } catch (e) {
      this.logger.error(`Numbeo fetch failed for "${slug}": ${e}`);
      // Erreurs typées (IP bloquée / slug inconnu) : leur message EST le diagnostic —
      // « Check the Numbeo slug » envoyait l'admin chasser des slugs corrects alors
      // que Numbeo bloquait simplement l'IP du serveur (503 anti-bot).
      if (e instanceof NumbeoBlockedError || e instanceof NumbeoUnknownSlugError) {
        throw new HttpException(e.message, HttpStatus.BAD_GATEWAY);
      }
      throw new HttpException(
        `Could not fetch Numbeo for slug "${slug}": ${(e as Error).message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    const data: CuratedData = parseNumbeo(
      html,
      ref,
      new Date().toISOString().slice(0, 10),
    );

    // Guard against a wrong slug returning a page with no usable prices.
    const hasData =
      !!data.summary.averageSalary ||
      !!data.categories.housing.rent.oneBedroom.cityCenter.avg;
    if (!hasData) {
      throw new HttpException(
        `No usable cost-of-living data parsed for "${slug}" — likely a wrong Numbeo slug.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const cityId = await this.resolveOrCreateCity(cityName, country);
    await this.persistCurated(cityId, data);
    this.memCache.delete(this.memKey(cityName, country));

    // AUTO-CHAIN (fire-and-forget): one Numbeo fetch also refreshes the city's quality-of-life
    // and property indices, reusing the SAME (possibly admin-corrected) slug. Failures are
    // logged but never break the cost-of-living result.
    void this.chainCityIndices(cityId, slug, cityName);

    this.logger.log(
      `🌐 Admin curated ${cityName}, ${country} (city_id=${cityId}) from Numbeo`,
    );
    return {
      cityId,
      city: cityName,
      country,
      currency,
      slug,
      pricedFields: this.countPricedFields(data.categories),
      rentAvg: data.categories.housing.rent.oneBedroom.cityCenter.avg,
      unavailable: data.meta.unavailable ?? [],
      summary: data.summary,
    };
  }

  /** Fire-and-forget refresh of the city's QoL + property indices (same Numbeo slug). */
  private async chainCityIndices(
    cityId: number,
    slug: string,
    cityName: string,
  ): Promise<void> {
    const results = await Promise.allSettled([
      this.qualityOfLife?.getByCity(cityId, {
        refresh: true,
        slugOverride: slug,
      }),
      this.propertyInvestment?.getByCity(cityId, {
        refresh: true,
        slugOverride: slug,
      }),
    ]);
    results.forEach((r, i) => {
      const label = i === 0 ? 'quality-of-life' : 'property-investment';
      if (r.status === 'rejected') {
        this.logger.warn(
          `Auto-chained ${label} fetch failed for ${cityName}: ${(r.reason as Error)?.message}`,
        );
      }
    });
    this.logger.log(`🔗 Auto-chained city indices refreshed for ${cityName}`);
  }

  // Count populated price leaves (avg > 0) across all categories — a quick
  // "how comprehensive is this snapshot" signal for the admin UI.
  private countPricedFields(node: unknown): number {
    if (node && typeof node === 'object') {
      const rec = node as Record<string, unknown>;
      if (typeof rec.avg === 'number') return rec.avg > 0 ? 1 : 0;
      return Object.values(rec).reduce<number>(
        (sum, v) => sum + this.countPricedFields(v),
        0,
      );
    }
    return 0;
  }

  private async persistCurated(
    cityId: number,
    data: CuratedData,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + this.CURATED_TTL_MS);
    const existing = await this.cacheRepository.findOne({ where: { cityId } });
    if (existing) {
      existing.data = data;
      existing.cachedAt = new Date();
      existing.expiresAt = expiresAt;
      await this.cacheRepository.save(existing);
    } else {
      await this.cacheRepository.save(
        this.cacheRepository.create({
          cityId,
          data,
          cachedAt: new Date(),
          expiresAt,
          city: { idCity: cityId } as any,
        }),
      );
    }
  }

  private async fetchFromApi(
    cityName: string,
    countryName: string,
  ): Promise<CleanedCostOfLivingData> {
    let apiCityName = cityName;
    if (cityName === 'New York City') apiCityName = 'New York';
    if (cityName === 'Zurich' || cityName === 'Zürich') apiCityName = 'Geneva';

    let apiCountryName = countryName;
    if (countryName === 'États-Unis') apiCountryName = 'United States';
    if (countryName === 'Japon') apiCountryName = 'Japan';
    if (countryName === 'Suisse') apiCountryName = 'Switzerland';

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(
          `🌐 Fetching cost of living for ${apiCityName}, ${apiCountryName} (attempt ${attempt})`,
        );
        const response = await axios.request({
          method: 'GET',
          url: `${this.BASE_URL}/prices`,
          params: { city_name: apiCityName, country_name: apiCountryName },
          headers: {
            'x-rapidapi-key': this.RAPIDAPI_KEY,
            'x-rapidapi-host': this.RAPIDAPI_HOST,
          },
        });
        return this.cleanerService.cleanData(response.data);
      } catch (error: any) {
        const status = error?.response?.status;
        if (status === 429 && attempt < maxRetries) {
          const delay = 2000 * attempt;
          this.logger.warn(
            `⏳ Rate-limited (429) for ${cityName} — retrying in ${delay}ms…`,
          );
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        this.logger.error(
          `Error fetching cost of living for ${cityName} from external API: ${error?.message || error}. Falling back to empty template.`,
        );
        return this.createEmptyCostOfLiving(cityName, countryName);
      }
    }
    return this.createEmptyCostOfLiving(cityName, countryName);
  }

  private validateCountry(country: string): string | null {
    const key = country.toLowerCase().trim();
    return this.ALLOWED_COUNTRIES.get(key) ?? null;
  }

  async cleanExpiredCache(): Promise<number> {
    const result = await this.cacheRepository.delete({
      expiresAt: LessThan(new Date()),
    });
    const count = result.affected || 0;
    this.logger.log(`🧹 Cleaned ${count} expired cache entries`);
    return count;
  }

  private readonly SUPPORTED_CITIES = [
    { city: 'Paris', country: 'France' },
    { city: 'New York', country: 'United States' },
    { city: 'Tokyo', country: 'Japan' },
    { city: 'Geneva', country: 'Switzerland' },
  ];

  async seedAllCities(): Promise<{
    seeded: string[];
    skipped: string[];
    errors: string[];
  }> {
    const seeded: string[] = [];
    const skipped: string[] = [];
    const errors: string[] = [];

    for (const { city, country } of this.SUPPORTED_CITIES) {
      const key = this.memKey(city, country);

      const mem = this.memGet(key);
      if (mem) {
        skipped.push(`${city}, ${country} (memory cache)`);
        continue;
      }

      const existing = await this.cacheRepository
        .createQueryBuilder('cache')
        .where("LOWER(cache.data -> 'city' ->> 'name') = LOWER(:cityName)", {
          cityName: city,
        })
        .andWhere(
          "LOWER(cache.data -> 'city' ->> 'country') = LOWER(:countryName)",
          { countryName: country },
        )
        .andWhere('cache.expiresAt > NOW()')
        .getOne();

      if (existing) {
        this.memSet(key, existing.data as CleanedCostOfLivingData);
        skipped.push(`${city}, ${country} (DB cache)`);
        continue;
      }

      try {
        this.logger.log(`🌱 Seeding ${city}, ${country}…`);
        const data = await this.fetchFromApi(city, country);
        this.memSet(key, data);

        const cityId = await this.resolveOrCreateCity(city, country);
        await this.persistToDb(cityId, data);

        seeded.push(`${city}, ${country}`);
      } catch (e: any) {
        errors.push(`${city}, ${country}: ${e.message}`);
      }

      await new Promise((r) => setTimeout(r, 4000));
    }

    this.logger.log(
      `🌱 Seed complete: ${seeded.length} seeded, ${skipped.length} skipped, ${errors.length} errors`,
    );
    return { seeded, skipped, errors };
  }

  private async resolveOrCreateCity(
    cityName: string,
    countryName: string,
  ): Promise<number> {
    const existing = await this.cityRepository
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.country', 'co')
      .where('LOWER(c.name) = LOWER(:cityName)', { cityName })
      .andWhere('LOWER(co.name) = LOWER(:countryName)', { countryName })
      .getOne();

    if (existing) return existing.idCity;

    let countryEntity = await this.countryRepository.findOne({
      where: { countryName: countryName },
    });

    if (!countryEntity) {
      countryEntity = await this.countryRepository.save(
        this.countryRepository.create({
          countryName: countryName,
          continentId: 1,
        }),
      );
      this.logger.log(
        `🌍 Created country: ${countryName} (idCountry=${countryEntity.idCountry})`,
      );
    }

    const newCity = await this.cityRepository.save(
      this.cityRepository.create({
        name: cityName,
        country: countryEntity,
        isCapital: false,
      }),
    );
    this.logger.log(`🏙️ Created city: ${cityName} (idCity=${newCity.idCity})`);
    return newCity.idCity;
  }
}
