import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';
import { SearchJobDto } from './dto/search-job.dto';
import { AdzunaJobDto, AdzunaSearchResponseDto } from './dto/adzuna-job.dto';

interface CacheEntry {
  data: AdzunaSearchResponseDto;
  timestamp: number;
}

@Injectable()
export class AdzunaService {
  private readonly logger = new Logger(AdzunaService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 60 * 60 * 1000;
  private readonly APP_ID = process.env.ADZUNA_APP_ID;
  private readonly APP_KEY = process.env.ADZUNA_APP_KEY;
  private readonly BASE_URL = 'https://api.adzuna.com/v1/api/jobs';
  private readonly SUPPORTED_COUNTRIES = new Set([
    'gb',
    'us',
    'au',
    'br',
    'ca',
    'de',
    'fr',
    'in',
    'it',
    'nl',
    'nz',
    'pl',
    'sg',
    'za',
    'at',
    'be',
    'ch',
    'mx',
    'es',
  ]);

  private readonly COUNTRY_CURRENCY: Record<string, string> = {
    gb: 'GBP',
    us: 'USD',
    au: 'AUD',
    br: 'BRL',
    ca: 'CAD',
    de: 'EUR',
    fr: 'EUR',
    in: 'INR',
    it: 'EUR',
    nl: 'EUR',
    nz: 'NZD',
    pl: 'PLN',
    sg: 'SGD',
    za: 'ZAR',
    at: 'EUR',
    be: 'EUR',
    ch: 'CHF',
    mx: 'MXN',
    es: 'EUR',
  };

  async searchJobs(searchDto: SearchJobDto): Promise<AdzunaSearchResponseDto> {
    if (!this.APP_ID || !this.APP_KEY) {
      throw new HttpException(
        'Adzuna API credentials not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    const countryCode = (searchDto.country || 'fr').toLowerCase();
    if (!this.SUPPORTED_COUNTRIES.has(countryCode)) {
      this.logger.warn(
        `Country "${countryCode}" is not supported by Adzuna. Returning empty results.`,
      );
      return {
        results: [],
        total: 0,
        page: searchDto.page || 1,
        perPage: searchDto.resultsPerPage || 20,
        totalPages: 0,
      };
    }

    const cacheKey = this.generateCacheKey(searchDto);
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      this.logger.log(`📦 Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`🌐 Cache MISS - Calling Adzuna API for: ${cacheKey}`);

    try {
      const url = this.buildApiUrl(searchDto);
      this.logger.log(`🔗 Adzuna API URL: ${url}`);

      const response = await axios.get(url, {
        headers: {
          Accept: 'application/json',
        },
        timeout: 10000,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });

      const data = response.data;
      const normalizedData = this.normalizeResponse(data, searchDto);
      this.setCache(cacheKey, normalizedData);

      this.logger.log(
        `✅ Successfully fetched ${normalizedData.results.length} jobs from Adzuna`,
      );

      return normalizedData;
    } catch (error) {
      this.logger.error('❌ Error calling Adzuna API:', error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status || HttpStatus.BAD_GATEWAY;
        const message = error.response?.data?.message || error.message;
        throw new HttpException(
          `Failed to fetch jobs from Adzuna: ${message}`,
          status,
        );
      }

      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to fetch jobs from Adzuna: ${errorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  private buildApiUrl(searchDto: SearchJobDto): string {
    const {
      country = 'fr',
      city,
      keyword,
      category,
      page = 1,
      resultsPerPage = 20,
      salaryMin,
      salaryMax,
      sortBy = 'relevance',
      full_time,
      part_time,
      contract,
      permanent,
      what_exclude,
      max_days_old,
    } = searchDto;

    let url = `${this.BASE_URL}/${country}/search/${page}?app_id=${this.APP_ID}&app_key=${this.APP_KEY}`;
    url += `&results_per_page=${Math.min(resultsPerPage, 50)}`;

    if (keyword) {
      url += `&what=${encodeURIComponent(keyword)}`;
    }

    if (what_exclude) {
      url += `&what_exclude=${encodeURIComponent(what_exclude)}`;
    }

    if (city) {
      url += `&where=${encodeURIComponent(city)}`;
    }

    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    if (salaryMin) {
      url += `&salary_min=${salaryMin}`;
    }

    if (salaryMax) {
      url += `&salary_max=${salaryMax}`;
    }

    if (sortBy === 'date') {
      url += `&sort_by=date`;
    } else if (sortBy === 'salary') {
      url += `&sort_by=salary`;
    }

    const contractFilters = [
      full_time && 'full_time',
      part_time && 'part_time',
      contract && 'contract',
      permanent && 'permanent',
    ].filter(Boolean);

    if (contractFilters.length === 1) {
      url += `&${contractFilters[0]}=1`;
    }

    if (max_days_old) url += `&max_days_old=${max_days_old}`;

    return url;
  }

  private readonly MONTHLY_SALARY_THRESHOLD: Record<string, number> = {
    EUR: 10000,
    GBP: 8500,
    CHF: 12000,
    USD: 12000,
    CAD: 12000,
    AUD: 12000,
    NZD: 10000,
    PLN: 40000,
    SGD: 15000,
    ZAR: 150000,
    BRL: 50000,
    MXN: 200000,
    INR: 500000,
  };

  private detectSalaryPeriod(
    salary: number,
    currency: string,
  ): 'month' | 'year' {
    const threshold = this.MONTHLY_SALARY_THRESHOLD[currency] || 10000;
    return salary < threshold ? 'month' : 'year';
  }

  private normalizeResponse(
    data: any,
    searchDto: SearchJobDto,
  ): AdzunaSearchResponseDto {
    const countryCode = (searchDto.country || 'fr').toLowerCase();
    const currency = this.COUNTRY_CURRENCY[countryCode] || 'EUR';

    const results: AdzunaJobDto[] = data.results.map((job: any) => {
      const salaryValue = job.salary_min || job.salary_max;
      const period = salaryValue
        ? this.detectSalaryPeriod(salaryValue, currency)
        : undefined;

      return {
        id: job.id,
        title: job.title,
        company: job.company?.display_name || 'Non spécifié',
        location: {
          city: job.location?.display_name?.split(',')[0],
          country: searchDto.country || 'fr',
          displayName: job.location?.display_name || 'Non spécifié',
        },
        description: job.description,
        salary: salaryValue
          ? {
              min: job.salary_min,
              max: job.salary_max,
              currency,
              period,
            }
          : undefined,
        contract_type: job.contract_type || job.contract_time,
        remote: this.detectRemote(job.title, job.description),
        redirect_url: job.redirect_url,
        created_at: new Date(job.created),
        category: job.category?.label,
        company_logo: undefined,
      };
    });

    const total = data.count || 0;
    const perPage = searchDto.resultsPerPage || 20;
    const totalPages = Math.ceil(total / perPage);

    return {
      results,
      total,
      page: searchDto.page || 1,
      perPage,
      totalPages,
    };
  }

  private detectRemote(title: string, description: string): boolean {
    const remoteKeywords = [
      'remote',
      'télétravail',
      'teletravail',
      'work from home',
      'wfh',
      'à distance',
      'home office',
    ];

    const text = `${title} ${description}`.toLowerCase();
    return remoteKeywords.some((keyword) => text.includes(keyword));
  }

  private generateCacheKey(searchDto: SearchJobDto): string {
    return JSON.stringify(searchDto);
  }

  private getFromCache(key: string): AdzunaSearchResponseDto | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      this.logger.log(`🗑️  Cache expired for: ${key}`);
      return null;
    }

    return entry.data;
  }

  private setCache(key: string, data: AdzunaSearchResponseDto): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    this.logger.log(`💾 Cached data for: ${key}`);
  }

  clearExpiredCache(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.logger.log(`🧹 Cleaned ${deletedCount} expired cache entries`);
    }
  }
}
