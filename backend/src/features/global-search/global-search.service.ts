import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { GlobalSearchDto } from './dto/global-search.dto';
import {
  GlobalSearchResult,
  GlobalSearchResponse,
} from './interfaces/global-search.interface';

@Injectable()
export class GlobalSearchService {
  private readonly logger = new Logger(GlobalSearchService.name);

  constructor(private readonly dataSource: DataSource) {}

  async search(dto: GlobalSearchDto): Promise<GlobalSearchResponse> {
    const { q, category, limit = 10 } = dto;
    const trimmed = q.trim();
    if (!trimmed) {
      return { results: [], total: 0, query: q };
    }

    try {
      return await this.ftsSearch(trimmed, category, limit);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `FTS search failed (matview may not exist yet), falling back to ILIKE: ${msg}`,
      );
      return this.fallbackSearch(trimmed, category, limit);
    }
  }

  async refreshIndex(): Promise<void> {
    // Force le recalcul du search_vector sur toutes les lignes via le trigger BEFORE UPDATE
    await this.dataSource.query(`
      UPDATE "global_search_index" SET "title" = "title"
    `);
    this.logger.log('global_search_index search vectors refreshed');
  }

  private buildTsQuery(raw: string): string {
    return raw
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => `${word}:*`)
      .join(' & ');
  }

  private async ftsSearch(
    q: string,
    category: string | undefined,
    limit: number,
  ): Promise<GlobalSearchResponse> {
    const tsQuery = this.buildTsQuery(q);

    let whereClause = `search_vector @@ to_tsquery('simple', $1)`;
    const params: (string | number)[] = [tsQuery];

    if (category) {
      whereClause += ` AND category = $2`;
      params.push(category);
    }

    const limitParam = `$${params.length + 1}`;
    params.push(limit);

    const sql = `
      SELECT
        category,
        entity_id     AS "entityId",
        title,
        description,
        extra,
        url,
        country_name  AS "countryName",
        image_url     AS "imageUrl",
        ts_rank_cd(search_vector, to_tsquery('simple', $1)) AS rank
      FROM global_search_index
      WHERE ${whereClause}
      ORDER BY rank DESC, title ASC
      LIMIT ${limitParam}
    `;

    const rows: GlobalSearchResult[] = await this.dataSource.query(sql, params);

    return {
      results: rows,
      total: rows.length,
      query: q,
    };
  }

  private async fallbackSearch(
    q: string,
    category: string | undefined,
    limit: number,
  ): Promise<GlobalSearchResponse> {
    const like = `%${q}%`;
    const results: GlobalSearchResult[] = [];

    if (!category || category === 'country') {
      const countries = await this.dataSource.query(
        `SELECT id::text AS "entityId", name AS title
         FROM country WHERE name ILIKE $1 LIMIT $2`,
        [like, limit],
      );
      for (const c of countries) {
        results.push({
          category: 'country',
          entityId: c.entityId,
          title: c.title,
          description: '',
          extra: '',
          url: null,
          countryName: c.title,
          imageUrl: null,
          rank: 1,
        });
      }
    }

    if (!category || category === 'city') {
      const cities = await this.dataSource.query(
        `SELECT ci.id::text AS "entityId", ci.name AS title,
                ci.image_url AS "imageUrl", co.name AS "countryName"
         FROM city ci JOIN country co ON co.id = ci.country_id
         WHERE ci.name ILIKE $1 OR co.name ILIKE $1
         LIMIT $2`,
        [like, limit],
      );
      for (const c of cities) {
        results.push({
          category: 'city',
          entityId: c.entityId,
          title: c.title,
          description: '',
          extra: c.countryName,
          url: null,
          countryName: c.countryName,
          imageUrl: c.imageUrl,
          rank: 0.5,
        });
      }
    }

    return {
      results: results.slice(0, limit),
      total: results.length,
      query: q,
    };
  }
}
