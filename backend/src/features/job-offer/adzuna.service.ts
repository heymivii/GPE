import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';
import { SearchJobDto } from './dto/search-job.dto';
import {
  AdzunaJobDto,
  AdzunaSearchResponseDto,
} from './dto/adzuna-job.dto';

interface CacheEntry {
  data: AdzunaSearchResponseDto;
  timestamp: number;
}

@Injectable()
export class AdzunaService {
  private readonly logger = new Logger(AdzunaService.name);
  private readonly cache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 60 * 60 * 1000; // 1 heure en millisecondes
  private readonly APP_ID = process.env.ADZUNA_APP_ID;
  private readonly APP_KEY = process.env.ADZUNA_APP_KEY;
  private readonly BASE_URL = 'https://api.adzuna.com/v1/api/jobs';

  /**
   * Rechercher des offres d'emploi via l'API Adzuna
   */
  async searchJobs(
    searchDto: SearchJobDto,
  ): Promise<AdzunaSearchResponseDto> {
    // Vérifier les credentials
    if (!this.APP_ID || !this.APP_KEY) {
      throw new HttpException(
        'Adzuna API credentials not configured',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Générer la clé de cache
    const cacheKey = this.generateCacheKey(searchDto);

    // Vérifier le cache
    const cachedData = this.getFromCache(cacheKey);
    if (cachedData) {
      this.logger.log(`📦 Cache HIT for: ${cacheKey}`);
      return cachedData;
    }

    this.logger.log(`🌐 Cache MISS - Calling Adzuna API for: ${cacheKey}`);

    try {
      // Construire l'URL de l'API
      const url = this.buildApiUrl(searchDto);
      this.logger.log(`🔗 Adzuna API URL: ${url}`);

      // Appeler l'API Adzuna avec axios
      const response = await axios.get(url, {
        headers: {
          Accept: 'application/json',
        },
        timeout: 10000, // 10 secondes
        httpsAgent: new https.Agent({
          rejectUnauthorized: false, // Pour éviter les erreurs de certificat SSL
        }),
      });

      const data = response.data;

      // Normaliser les données
      const normalizedData = this.normalizeResponse(data, searchDto);

      // Mettre en cache
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
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HttpException(
        `Failed to fetch jobs from Adzuna: ${errorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Construire l'URL de l'API Adzuna
   */
  private buildApiUrl(searchDto: SearchJobDto): string {
    const {
      country = 'fr',
      city,
      keyword,
      category,
      page = 1,
      resultsPerPage = 20,
      salaryMin,
      sortBy = 'relevance',
    } = searchDto;

    // URL de base avec pays
    let url = `${this.BASE_URL}/${country}/search/${page}?app_id=${this.APP_ID}&app_key=${this.APP_KEY}`;

    // Nombre de résultats par page (max 50)
    url += `&results_per_page=${Math.min(resultsPerPage, 50)}`;

    // Mot-clé de recherche
    if (keyword) {
      url += `&what=${encodeURIComponent(keyword)}`;
    }

    // Localisation (ville)
    if (city) {
      url += `&where=${encodeURIComponent(city)}`;
    }

    // Catégorie
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    // Salaire minimum
    if (salaryMin) {
      url += `&salary_min=${salaryMin}`;
    }

    // Tri
    if (sortBy === 'date') {
      url += `&sort_by=date`;
    } else if (sortBy === 'salary') {
      url += `&sort_by=salary`;
    }

    // Filtres supplémentaires
    url += `&full_time=1`; // Favoriser les postes à temps plein

    return url;
  }

  /**
   * Normaliser la réponse de l'API Adzuna
   */
  private normalizeResponse(
    data: any,
    searchDto: SearchJobDto,
  ): AdzunaSearchResponseDto {
    const results: AdzunaJobDto[] = data.results.map((job: any) => ({
      id: job.id,
      title: job.title,
      company: job.company?.display_name || 'Non spécifié',
      location: {
        city: job.location?.display_name?.split(',')[0],
        country: searchDto.country || 'fr',
        displayName: job.location?.display_name || 'Non spécifié',
      },
      description: job.description,
      salary: job.salary_min || job.salary_max
        ? {
            min: job.salary_min,
            max: job.salary_max,
            currency: 'EUR', // À adapter selon le pays
          }
        : undefined,
      contract_type: job.contract_type || job.contract_time,
      remote: this.detectRemote(job.title, job.description),
      redirect_url: job.redirect_url,
      created_at: new Date(job.created),
      category: job.category?.label,
      company_logo: job.company?.display_name
        ? `https://logo.clearbit.com/${job.company.display_name.replace(/\s+/g, '')}.com`
        : undefined,
    }));

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

  /**
   * Détecter si l'offre est en télétravail
   */
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

  /**
   * Générer une clé de cache unique
   */
  private generateCacheKey(searchDto: SearchJobDto): string {
    return JSON.stringify(searchDto);
  }

  /**
   * Récupérer du cache
   */
  private getFromCache(key: string): AdzunaSearchResponseDto | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Vérifier si le cache est encore valide
    const now = Date.now();
    if (now - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      this.logger.log(`🗑️  Cache expired for: ${key}`);
      return null;
    }

    return entry.data;
  }

  /**
   * Mettre en cache
   */
  private setCache(key: string, data: AdzunaSearchResponseDto): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
    this.logger.log(`💾 Cached data for: ${key}`);
  }

  /**
   * Nettoyer le cache (optionnel, pour éviter la fuite mémoire)
   */
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
