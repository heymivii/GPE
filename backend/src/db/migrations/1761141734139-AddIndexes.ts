import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1761141734139 implements MigrationInterface {
  name: string = 'AddIndexes1761141734139';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE INDEX idx_country_continent ON COUNTRY(continent_id);
      CREATE INDEX idx_user_country_origin ON USERS(origin_country_id);
      CREATE INDEX idx_user_country_destination ON USERS(destination_country_id);
      CREATE INDEX idx_cost_of_living_city ON COST_OF_LIVING(city_id);
      CREATE INDEX idx_job_offer_city ON JOB_OFFER(city_id);
      CREATE INDEX idx_job_offer_sector ON JOB_OFFER(sector_id);
      CREATE INDEX idx_forum_topic_country ON FORUM_TOPIC(country_id);
      CREATE INDEX idx_forum_message_topic ON FORUM_MESSAGE(topic_id);
      CREATE INDEX idx_notification_user ON NOTIFICATION(user_id);
      
      CREATE INDEX idx_user_email ON USERS(email);
      CREATE INDEX idx_country_iso_code ON COUNTRY(iso_code);
      CREATE INDEX idx_continent_iso_code ON CONTINENT(iso_code);
      CREATE INDEX idx_city_name ON CITY(name);
      CREATE INDEX idx_country_name ON COUNTRY(name);
      CREATE INDEX idx_city_country ON CITY(country_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_country_continent;
      DROP INDEX IF EXISTS idx_user_country_origin;
      DROP INDEX IF EXISTS idx_user_country_destination;
      DROP INDEX IF EXISTS idx_cost_of_living_city;
      DROP INDEX IF EXISTS idx_job_offer_city;
      DROP INDEX IF EXISTS idx_job_offer_sector;
      DROP INDEX IF EXISTS idx_forum_topic_country;
      DROP INDEX IF EXISTS idx_forum_message_topic;
      DROP INDEX IF EXISTS idx_notification_user;
      
      DROP INDEX IF EXISTS idx_user_email;
      DROP INDEX IF EXISTS idx_country_iso_code;
      DROP INDEX IF EXISTS idx_continent_iso_code;
      DROP INDEX IF EXISTS idx_city_name;
      DROP INDEX IF EXISTS idx_country_name;
      DROP INDEX IF EXISTS idx_city_country;
    `);
  }
}
