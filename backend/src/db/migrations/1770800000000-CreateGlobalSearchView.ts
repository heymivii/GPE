import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGlobalSearchView1770800000000 implements MigrationInterface {
  name = 'CreateGlobalSearchView1770800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE MATERIALIZED VIEW IF NOT EXISTS global_search_index AS

      -- ── Countries ──
      SELECT
        'country'                      AS category,
        c.id_country::text             AS entity_id,
        c.country_name                 AS title,
        COALESCE(c.visa_info, '')      AS description,
        co.continent_name              AS extra,
        NULL                           AS url,
        c.country_name                 AS country_name,
        c.flag_url                     AS image_url,
        setweight(to_tsvector('simple', coalesce(c.country_name, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(c.visa_info, '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(co.continent_name, '')), 'B')
                                       AS search_vector
      FROM country c
      LEFT JOIN continent co ON co.id_continent = c.id_continent

      UNION ALL

      -- ── Cities ──
      SELECT
        'city'                         AS category,
        ci.id_city::text               AS entity_id,
        ci.city_name                   AS title,
        COALESCE(ci.description, '')   AS description,
        c.country_name                 AS extra,
        NULL                           AS url,
        c.country_name                 AS country_name,
        ci.image_url                   AS image_url,
        setweight(to_tsvector('simple', coalesce(ci.city_name, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(ci.description, '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(c.country_name, '')), 'B')
                                       AS search_vector
      FROM city ci
      JOIN country c ON c.id_country = ci.id_country

      UNION ALL

      -- ── Guides ──
      SELECT
        'guide'                        AS category,
        g.id_guide::text               AS entity_id,
        g.title                        AS title,
        COALESCE(LEFT(g.content, 300), '') AS description,
        COALESCE(g.guide_type, '')     AS extra,
        NULL                           AS url,
        c.country_name                 AS country_name,
        NULL                           AS image_url,
        setweight(to_tsvector('simple', coalesce(g.title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(g.content, '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(g.guide_type, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(c.country_name, '')), 'B')
                                       AS search_vector
      FROM guide g
      JOIN country c ON c.id_country = g.id_country

      UNION ALL

      -- ── Checklists ──
      SELECT
        'checklist'                    AS category,
        ch.id_checklist::text          AS entity_id,
        ch.title                       AS title,
        ''                             AS description,
        ''                             AS extra,
        NULL                           AS url,
        c.country_name                 AS country_name,
        NULL                           AS image_url,
        setweight(to_tsvector('simple', coalesce(ch.title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(c.country_name, '')), 'B')
                                       AS search_vector
      FROM checklist ch
      JOIN country c ON c.id_country = ch.id_country

      UNION ALL

      -- ── Resources ──
      SELECT
        'resource'                     AS category,
        r.id_resource::text            AS entity_id,
        r.title                        AS title,
        ''                             AS description,
        COALESCE(r.resource_type, '')  AS extra,
        r.url                          AS url,
        c.country_name                 AS country_name,
        NULL                           AS image_url,
        setweight(to_tsvector('simple', coalesce(r.title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(r.resource_type, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(c.country_name, '')), 'B')
                                       AS search_vector
      FROM resource r
      JOIN country c ON c.id_country = r.id_country

      UNION ALL

      -- ── Forum Topics ──
      SELECT
        'forum'                        AS category,
        ft.id_topic::text              AS entity_id,
        ft.title                       AS title,
        ''                             AS description,
        COALESCE(ft.category, '')      AS extra,
        NULL                           AS url,
        COALESCE(c.country_name, '')   AS country_name,
        NULL                           AS image_url,
        setweight(to_tsvector('simple', coalesce(ft.title, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(ft.category, '')), 'B') ||
        setweight(to_tsvector('simple', coalesce(c.country_name, '')), 'B')
                                       AS search_vector
      FROM forum_topic ft
      LEFT JOIN country c ON c.id_country = ft.id_country

      UNION ALL

      -- ── Administrative Procedures ──
      SELECT
        'procedure'                    AS category,
        ap.id_process::text            AS entity_id,
        ap.process_type                AS title,
        COALESCE(LEFT(ap.description, 300), '') AS description,
        ''                             AS extra,
        NULL                           AS url,
        c.country_name                 AS country_name,
        NULL                           AS image_url,
        setweight(to_tsvector('simple', coalesce(ap.process_type, '')), 'A') ||
        setweight(to_tsvector('simple', coalesce(ap.description, '')), 'C') ||
        setweight(to_tsvector('simple', coalesce(c.country_name, '')), 'B')
                                       AS search_vector
      FROM administrative_process ap
      JOIN country c ON c.id_country = ap.id_country
      ;
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_global_search_vector
      ON global_search_index USING GIN (search_vector);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_global_search_category
      ON global_search_index (category);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS global_search_index;`);
  }
}
