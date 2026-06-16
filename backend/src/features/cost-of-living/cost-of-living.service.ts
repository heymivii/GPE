import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import axios from 'axios';
import { CostOfLivingCleanerService } from './cost-of-living-cleaner.service';
import { CostOfLivingCache } from './entities/cost-of-living-cache.entity';
import { City } from '../city/entities/city.entity';
import { Country } from '../country/entities/country.entity';
import { CleanedCostOfLivingData } from './types/cost-of-living.types';

@Injectable()
export class CostOfLivingService {
  private readonly logger = new Logger(CostOfLivingService.name);
  private readonly RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
  private readonly RAPIDAPI_HOST = process.env.RAPIDAPI_HOST;
  private readonly BASE_URL = `https://${process.env.RAPIDAPI_HOST}`;

  private readonly CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

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
  ) { }

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

    const resolvedCityId = cityEntity
      ? cityEntity.idCity
      : await this.resolveOrCreateCity(city, normalizedCountry).catch((e) => {
        this.logger.warn(`Could not resolve/create city: ${e}`);
        return null;
      });

    if (resolvedCityId) {
      this.persistToDb(resolvedCityId, data).catch((e) =>
        this.logger.warn(`DB persist failed: ${e}`),
      );
    }

    return data;
  }

  async getCachedDataByCityId(
    cityId: number,
  ): Promise<CleanedCostOfLivingData | null> {
    this.logger.log(`🔍 getCachedDataByCityId called with cityId=${cityId} (type: ${typeof cityId})`);
    const cached = await this.cacheRepository.findOne({ where: { cityId } });
    this.logger.log(`🔍 cached result: ${cached ? `found (idCache=${cached.idCache}, cityId=${cached.cityId}, expires=${cached.expiresAt})` : 'NOT FOUND'}`);
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
    const isInvalidData = !cleanedData.summary.averageSalary && !cleanedData.categories.housing.rent.oneBedroom.cityCenter.avg;
    if (isInvalidData) {
      this.logger.warn(`Returned API data for ${cityName} is mostly empty/zeros. Not caching it.`);
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

  private createEmptyCostOfLiving(cityName: string, countryName: string): CleanedCostOfLivingData {
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
            oneBedroom: { cityCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' }, outsideCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
            threeBedroom: { cityCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' }, outsideCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
          },
          buy: {
            pricePerSqm: { cityCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' }, outsideCenter: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
          },
        },
        food: { markets: {} as any },
        transportation: {
          publicTransport: { oneWayTicket: { min: 0, avg: 0, max: 0, currency: 'EUR' }, monthlyPass: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
          taxi: { start: { min: 0, avg: 0, max: 0, currency: 'EUR' }, per1km: { min: 0, avg: 0, max: 0, currency: 'EUR' }, waitingHour: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
          personal: { gasoline1L: { min: 0, avg: 0, max: 0, currency: 'EUR' }, newCar: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
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
        clothing: { jeans: { min: 0, avg: 0, max: 0, currency: 'EUR' }, summerDress: { min: 0, avg: 0, max: 0, currency: 'EUR' }, runningShoes: { min: 0, avg: 0, max: 0, currency: 'EUR' }, leatherShoes: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
        childcare: { preschool: { min: 0, avg: 0, max: 0, currency: 'EUR' }, primarySchool: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
        sports: { cinema: { min: 0, avg: 0, max: 0, currency: 'EUR' }, gym: { min: 0, avg: 0, max: 0, currency: 'EUR' }, tennis: { min: 0, avg: 0, max: 0, currency: 'EUR' } },
        salary: { averageMonthly: { min: 0, avg: 0, max: 0, currency: 'EUR' }, mortgageRate: { min: 0, avg: 0, max: 0 } },
      },
      summary: {
        monthlyBudget: { min: 0, avg: 0, max: 0 },
        averageSalary: 0,
      },
    };
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
        this.countryRepository.create({ countryName: countryName, continentId: 1 }),
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
