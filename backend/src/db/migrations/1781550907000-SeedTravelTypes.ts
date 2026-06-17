import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTravelTypes1781550907000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "travel_type" ("id_travel_type", "name")
      VALUES
        (1, 'alone'),
        (2, 'couple'),
        (3, 'family'),
        (4, 'friends'),
        (5, 'other')
      ON CONFLICT ("id_travel_type") DO NOTHING
    `);

    await queryRunner.query(`SELECT setval(pg_get_serial_sequence('"travel_type"', 'id_travel_type'), 5, true)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "travel_type" WHERE "id_travel_type" IN (1, 2, 3, 4, 5)`);
  }
}
