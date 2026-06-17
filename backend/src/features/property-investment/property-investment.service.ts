import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  fetchPropertyInvestmentHtml,
  parsePropertyInvestment,
  PropertyInvestmentData,
} from './numbeo-property-parser';

export interface PropertyInvestmentResult extends PropertyInvestmentData {
  country: string;
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
  private readonly cache = new Map<string, CacheEntry>();

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
}
