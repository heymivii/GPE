import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QualityOfLifeCache } from './entities/quality-of-life-cache.entity';
import {
  fetchQualityOfLifeHtml,
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
  ) {}

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
      this.logger.error(`Numbeo quality-of-life fetch failed for "${country}": ${e}`);
      throw new HttpException(
        `Could not fetch Numbeo quality-of-life data for "${country}".`,
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
