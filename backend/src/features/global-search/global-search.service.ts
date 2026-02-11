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
    await this.dataSource.query(
      'REFRESH MATERIALIZED VIEW global_search_index',
    );
    this.logger.log('global_search_index materialized view refreshed');
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
        `SELECT id_country::text AS "entityId", country_name AS title, 
                COALESCE(visa_info,'') AS description, flag_url AS "imageUrl"
         FROM country WHERE country_name ILIKE $1 LIMIT $2`,
        [like, limit],
      );
      for (const c of countries) {
        results.push({
          category: 'country',
          entityId: c.entityId,
          title: c.title,
          description: c.description,
          extra: '',
          url: null,
          countryName: c.title,
          imageUrl: c.imageUrl,
          rank: 1,
        });
      }
    }

    if (!category || category === 'city') {
      const cities = await this.dataSource.query(
        `SELECT ci.id_city::text AS "entityId", ci.city_name AS title,
                COALESCE(ci.description,'') AS description, ci.image_url AS "imageUrl",
                co.country_name AS "countryName"
         FROM city ci JOIN country co ON co.id_country = ci.id_country
         WHERE ci.city_name ILIKE $1 OR co.country_name ILIKE $1
         LIMIT $2`,
        [like, limit],
      );
      for (const c of cities) {
        results.push({
          category: 'city',
          entityId: c.entityId,
          title: c.title,
          description: c.description,
          extra: c.countryName,
          url: null,
          countryName: c.countryName,
          imageUrl: c.imageUrl,
          rank: 0.5,
        });
      }
    }

    if (!category || category === 'guide') {
      const guides = await this.dataSource.query(
        `SELECT g.guide_id::text AS "entityId", g.title,
                COALESCE(LEFT(g.content, 200),'') AS description,
                co.country_name AS "countryName"
         FROM guide g JOIN country co ON co.id_country = g.country_id
         WHERE g.title ILIKE $1 OR g.content ILIKE $1
         LIMIT $2`,
        [like, limit],
      );
      for (const g of guides) {
        results.push({
          category: 'guide',
          entityId: g.entityId,
          title: g.title,
          description: g.description,
          extra: '',
          url: null,
          countryName: g.countryName,
          imageUrl: null,
          rank: 0.4,
        });
      }
    }

    if (!category || category === 'forum') {
      const topics = await this.dataSource.query(
        `SELECT ft.id_topic::text AS "entityId", ft.title,
                COALESCE(ft.category,'') AS extra,
                COALESCE(co.country_name,'') AS "countryName"
         FROM forum_topic ft LEFT JOIN country co ON co.id_country = ft.id_country
         WHERE ft.title ILIKE $1
         LIMIT $2`,
        [like, limit],
      );
      for (const t of topics) {
        results.push({
          category: 'forum',
          entityId: t.entityId,
          title: t.title,
          description: '',
          extra: t.extra,
          url: null,
          countryName: t.countryName,
          imageUrl: null,
          rank: 0.3,
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
