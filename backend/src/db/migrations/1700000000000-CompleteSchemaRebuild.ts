import { MigrationInterface, QueryRunner } from 'typeorm';

export class CompleteSchemaRebuild1700000000000 implements MigrationInterface {
  name = 'CompleteSchemaRebuild1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {

    await queryRunner.query(`DROP TABLE IF EXISTS "notification" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "forum_message" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "forum_topic" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "experience" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "job_offer" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "industry_sector" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "business_sector" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "city_comparison" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cost_of_living" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "process_tracking" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "administrative_process" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "resource" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "checklist" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "guide" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "expatriation_project" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "user" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "app_user" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "city" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "country" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "continent" CASCADE`);

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE`,
    );

    await queryRunner.query(`
            CREATE TABLE "continent" (
                "id_continent" SERIAL NOT NULL,
                "continent_name" VARCHAR(50) NOT NULL,
                "iso_code" CHAR(2),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_continent_iso_code" UNIQUE ("iso_code"),
                CONSTRAINT "PK_continent" PRIMARY KEY ("id_continent")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "country" (
                "id_country" SERIAL NOT NULL,
                "country_name" VARCHAR(100) NOT NULL,
                "iso_code" CHAR(2),
                "currency" VARCHAR(50),
                "language" TEXT,
                "visa_info" TEXT,
                "flag_url" VARCHAR(255),
                "id_continent" INTEGER NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_country_iso_code" UNIQUE ("iso_code"),
                CONSTRAINT "PK_country" PRIMARY KEY ("id_country")
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_country_name" ON "country" ("country_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_country_iso" ON "country" ("iso_code")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_country_continent" ON "country" ("id_continent")`,
    );

    await queryRunner.query(`
            ALTER TABLE "country" 
            ADD CONSTRAINT "FK_country_continent" 
            FOREIGN KEY ("id_continent") 
            REFERENCES "continent"("id_continent") 
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "city" (
                "id_city" SERIAL NOT NULL,
                "city_name" VARCHAR(100) NOT NULL,
                "latitude" DECIMAL(10,8),
                "longitude" DECIMAL(11,8),
                "population" INTEGER,
                "id_country" INTEGER NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_city" PRIMARY KEY ("id_city")
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_city_name" ON "city" ("city_name")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_city_country" ON "city" ("id_country")`,
    );

    await queryRunner.query(`
            ALTER TABLE "city" 
            ADD CONSTRAINT "FK_city_country" 
            FOREIGN KEY ("id_country") 
            REFERENCES "country"("id_country") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "app_user" (
                "id_user" SERIAL NOT NULL,
                "full_name" VARCHAR(100) NOT NULL,
                "email" VARCHAR(255) NOT NULL,
                "password_hash" VARCHAR(255) NOT NULL,
                "user_role" VARCHAR(50) NOT NULL DEFAULT 'user',
                "age" INTEGER,
                "status" VARCHAR(50),
                "language_level" VARCHAR(50),
                "id_origin_country" INTEGER,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_app_user_email" UNIQUE ("email"),
                CONSTRAINT "PK_app_user" PRIMARY KEY ("id_user"),
                CONSTRAINT "CHK_app_user_role" CHECK ("user_role" IN ('user', 'admin', 'moderator')),
                CONSTRAINT "CHK_app_user_age" CHECK ("age" >= 18 AND "age" <= 120),
                CONSTRAINT "CHK_app_user_status" CHECK ("status" IN ('student', 'employee', 'self_employed', 'retired', 'unemployed', 'other')),
                CONSTRAINT "CHK_app_user_language" CHECK ("language_level" IN ('A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'native'))
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_app_user_email" ON "app_user" ("email")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_app_user_role" ON "app_user" ("user_role")`,
    );

    await queryRunner.query(`
            ALTER TABLE "app_user" 
            ADD CONSTRAINT "FK_app_user_origin_country" 
            FOREIGN KEY ("id_origin_country") 
            REFERENCES "country"("id_country") 
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "expatriation_project" (
                "id_project" SERIAL NOT NULL,
                "id_user" INTEGER NOT NULL,
                "id_destination_country" INTEGER NOT NULL,
                "id_destination_city" INTEGER,
                "travel_type" VARCHAR(50),
                "main_objective" VARCHAR(100),
                "expected_duration" INTEGER,
                "housing_budget" DECIMAL(10,2),
                "priorities" VARCHAR(100),
                "needs_support" BOOLEAN NOT NULL DEFAULT false,
                "project_status" VARCHAR(50) NOT NULL DEFAULT 'planning',
                "expected_departure_date" DATE,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_expatriation_project" PRIMARY KEY ("id_project"),
                CONSTRAINT "CHK_project_travel_type" CHECK ("travel_type" IN ('alone', 'couple', 'family', 'friends', 'other')),
                CONSTRAINT "CHK_project_objective" CHECK ("main_objective" IN ('work', 'study', 'retirement', 'adventure', 'family_reunion', 'other')),
                CONSTRAINT "CHK_project_duration" CHECK ("expected_duration" > 0),
                CONSTRAINT "CHK_project_budget" CHECK ("housing_budget" >= 0),
                CONSTRAINT "CHK_project_status" CHECK ("project_status" IN ('planning', 'active', 'completed', 'cancelled', 'on_hold'))
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_project_user" ON "expatriation_project" ("id_user")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_project_status" ON "expatriation_project" ("project_status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_project_destination_country" ON "expatriation_project" ("id_destination_country")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_project_destination_city" ON "expatriation_project" ("id_destination_city")`,
    );

    await queryRunner.query(`
            ALTER TABLE "expatriation_project" 
            ADD CONSTRAINT "FK_project_user" 
            FOREIGN KEY ("id_user") 
            REFERENCES "app_user"("id_user") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "expatriation_project" 
            ADD CONSTRAINT "FK_project_destination_country" 
            FOREIGN KEY ("id_destination_country") 
            REFERENCES "country"("id_country") 
            ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "expatriation_project" 
            ADD CONSTRAINT "FK_project_destination_city" 
            FOREIGN KEY ("id_destination_city") 
            REFERENCES "city"("id_city") 
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "guide" (
                "id_guide" SERIAL NOT NULL,
                "title" VARCHAR(255) NOT NULL,
                "content" TEXT NOT NULL,
                "guide_type" VARCHAR(50),
                "id_country" INTEGER NOT NULL,
                "author_id" INTEGER,
                "views_count" INTEGER NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_guide" PRIMARY KEY ("id_guide"),
                CONSTRAINT "CHK_guide_type" CHECK ("guide_type" IN ('housing', 'employment', 'health', 'education', 'legal', 'culture', 'transportation', 'other'))
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_guide_country" ON "guide" ("id_country")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_guide_type" ON "guide" ("guide_type")`,
    );

    await queryRunner.query(`
            ALTER TABLE "guide" 
            ADD CONSTRAINT "FK_guide_country" 
            FOREIGN KEY ("id_country") 
            REFERENCES "country"("id_country") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "guide" 
            ADD CONSTRAINT "FK_guide_author" 
            FOREIGN KEY ("author_id") 
            REFERENCES "app_user"("id_user") 
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "checklist" (
                "id_checklist" SERIAL NOT NULL,
                "title" VARCHAR(255) NOT NULL,
                "steps" JSONB NOT NULL,
                "id_country" INTEGER NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_checklist" PRIMARY KEY ("id_checklist")
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_checklist_country" ON "checklist" ("id_country")`,
    );

    await queryRunner.query(`
            ALTER TABLE "checklist" 
            ADD CONSTRAINT "FK_checklist_country" 
            FOREIGN KEY ("id_country") 
            REFERENCES "country"("id_country") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "resource" (
                "id_resource" SERIAL NOT NULL,
                "title" VARCHAR(255) NOT NULL,
                "url" VARCHAR(500),
                "resource_type" VARCHAR(50),
                "id_country" INTEGER NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_resource" PRIMARY KEY ("id_resource"),
                CONSTRAINT "CHK_resource_type" CHECK ("resource_type" IN ('article', 'video', 'pdf', 'website', 'podcast', 'tool', 'other'))
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_resource_country" ON "resource" ("id_country")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_resource_type" ON "resource" ("resource_type")`,
    );

    await queryRunner.query(`
            ALTER TABLE "resource" 
            ADD CONSTRAINT "FK_resource_country" 
            FOREIGN KEY ("id_country") 
            REFERENCES "country"("id_country") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "administrative_process" (
                "id_process" SERIAL NOT NULL,
                "process_type" VARCHAR(100) NOT NULL,
                "description" TEXT,
                "required_documents" TEXT,
                "average_duration" INTEGER,
                "id_country" INTEGER NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_administrative_process" PRIMARY KEY ("id_process")
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_process_country" ON "administrative_process" ("id_country")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_process_type" ON "administrative_process" ("process_type")`,
    );

    await queryRunner.query(`
            ALTER TABLE "administrative_process" 
            ADD CONSTRAINT "FK_process_country" 
            FOREIGN KEY ("id_country") 
            REFERENCES "country"("id_country") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "process_tracking" (
                "id_tracking" SERIAL NOT NULL,
                "status" VARCHAR(50) NOT NULL DEFAULT 'not_started',
                "start_date" DATE,
                "end_date" DATE,
                "comments" TEXT,
                "id_user" INTEGER NOT NULL,
                "id_process" INTEGER NOT NULL,
                "id_project" INTEGER NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_process_tracking" PRIMARY KEY ("id_tracking"),
                CONSTRAINT "CHK_tracking_status" CHECK ("status" IN ('not_started', 'in_progress', 'completed', 'blocked', 'cancelled'))
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_tracking_user" ON "process_tracking" ("id_user")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tracking_project" ON "process_tracking" ("id_project")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tracking_status" ON "process_tracking" ("status")`,
    );

    await queryRunner.query(`
            ALTER TABLE "process_tracking" 
            ADD CONSTRAINT "FK_tracking_user" 
            FOREIGN KEY ("id_user") 
            REFERENCES "app_user"("id_user") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "process_tracking" 
            ADD CONSTRAINT "FK_tracking_process" 
            FOREIGN KEY ("id_process") 
            REFERENCES "administrative_process"("id_process") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "process_tracking" 
            ADD CONSTRAINT "FK_tracking_project" 
            FOREIGN KEY ("id_project") 
            REFERENCES "expatriation_project"("id_project") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "cost_of_living" (
                "id_cost" SERIAL NOT NULL,
                "average_rent" DECIMAL(10,2),
                "monthly_transport" DECIMAL(10,2),
                "food_expenses" DECIMAL(10,2),
                "public_services" DECIMAL(10,2),
                "id_city" INTEGER NOT NULL,
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_cost_of_living" PRIMARY KEY ("id_cost"),
                CONSTRAINT "UQ_cost_city" UNIQUE ("id_city")
            )
        `);

    await queryRunner.query(`
            ALTER TABLE "cost_of_living" 
            ADD CONSTRAINT "FK_cost_city" 
            FOREIGN KEY ("id_city") 
            REFERENCES "city"("id_city") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "business_sector" (
                "id_sector" SERIAL NOT NULL,
                "sector_name" VARCHAR(100) NOT NULL,
                "description" TEXT,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_business_sector" PRIMARY KEY ("id_sector"),
                CONSTRAINT "UQ_sector_name" UNIQUE ("sector_name")
            )
        `);

    await queryRunner.query(`
            CREATE TABLE "job_offer" (
                "id_offer" SERIAL NOT NULL,
                "job_title" VARCHAR(255) NOT NULL,
                "company_name" VARCHAR(255),
                "average_salary" DECIMAL(10,2),
                "description" TEXT,
                "publication_date" DATE NOT NULL DEFAULT CURRENT_DATE,
                "id_city" INTEGER NOT NULL,
                "id_sector" INTEGER,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_job_offer" PRIMARY KEY ("id_offer")
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_offer_city" ON "job_offer" ("id_city")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_sector" ON "job_offer" ("id_sector")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_offer_date" ON "job_offer" ("publication_date")`,
    );

    await queryRunner.query(`
            ALTER TABLE "job_offer" 
            ADD CONSTRAINT "FK_offer_city" 
            FOREIGN KEY ("id_city") 
            REFERENCES "city"("id_city") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "job_offer" 
            ADD CONSTRAINT "FK_offer_sector" 
            FOREIGN KEY ("id_sector") 
            REFERENCES "business_sector"("id_sector") 
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "experience" (
                "id_experience" SERIAL NOT NULL,
                "title" VARCHAR(255) NOT NULL,
                "description" TEXT NOT NULL,
                "rating" INTEGER,
                "id_user" INTEGER NOT NULL,
                "id_city" INTEGER NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_experience" PRIMARY KEY ("id_experience"),
                CONSTRAINT "CHK_experience_rating" CHECK ("rating" >= 1 AND "rating" <= 5)
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_experience_user" ON "experience" ("id_user")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_experience_city" ON "experience" ("id_city")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_experience_date" ON "experience" ("created_at")`,
    );

    await queryRunner.query(`
            ALTER TABLE "experience" 
            ADD CONSTRAINT "FK_experience_user" 
            FOREIGN KEY ("id_user") 
            REFERENCES "app_user"("id_user") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "experience" 
            ADD CONSTRAINT "FK_experience_city" 
            FOREIGN KEY ("id_city") 
            REFERENCES "city"("id_city") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "city_comparison" (
                "id_comparison" SERIAL NOT NULL,
                "id_user" INTEGER NOT NULL,
                "id_city" INTEGER NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_city_comparison" PRIMARY KEY ("id_comparison"),
                CONSTRAINT "UQ_user_city_comparison" UNIQUE ("id_user", "id_city")
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_comparison_user" ON "city_comparison" ("id_user")`,
    );

    await queryRunner.query(`
            ALTER TABLE "city_comparison" 
            ADD CONSTRAINT "FK_comparison_user" 
            FOREIGN KEY ("id_user") 
            REFERENCES "app_user"("id_user") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "city_comparison" 
            ADD CONSTRAINT "FK_comparison_city" 
            FOREIGN KEY ("id_city") 
            REFERENCES "city"("id_city") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "forum_topic" (
                "id_topic" SERIAL NOT NULL,
                "title" VARCHAR(255) NOT NULL,
                "category" VARCHAR(50),
                "id_user" INTEGER NOT NULL,
                "id_country" INTEGER,
                "views_count" INTEGER NOT NULL DEFAULT 0,
                "is_pinned" BOOLEAN NOT NULL DEFAULT false,
                "is_locked" BOOLEAN NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_forum_topic" PRIMARY KEY ("id_topic"),
                CONSTRAINT "CHK_topic_category" CHECK ("category" IN ('question', 'testimony', 'advice', 'discussion', 'announcement', 'other'))
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_topic_user" ON "forum_topic" ("id_user")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_topic_country" ON "forum_topic" ("id_country")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_topic_category" ON "forum_topic" ("category")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_topic_created" ON "forum_topic" ("created_at")`,
    );

    await queryRunner.query(`
            ALTER TABLE "forum_topic" 
            ADD CONSTRAINT "FK_topic_user" 
            FOREIGN KEY ("id_user") 
            REFERENCES "app_user"("id_user") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "forum_topic" 
            ADD CONSTRAINT "FK_topic_country" 
            FOREIGN KEY ("id_country") 
            REFERENCES "country"("id_country") 
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "forum_message" (
                "id_message" SERIAL NOT NULL,
                "content" TEXT NOT NULL,
                "id_topic" INTEGER NOT NULL,
                "id_user" INTEGER NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_forum_message" PRIMARY KEY ("id_message")
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_message_topic" ON "forum_message" ("id_topic")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_message_user" ON "forum_message" ("id_user")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_message_created" ON "forum_message" ("created_at")`,
    );

    await queryRunner.query(`
            ALTER TABLE "forum_message" 
            ADD CONSTRAINT "FK_message_topic" 
            FOREIGN KEY ("id_topic") 
            REFERENCES "forum_topic"("id_topic") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            ALTER TABLE "forum_message" 
            ADD CONSTRAINT "FK_message_user" 
            FOREIGN KEY ("id_user") 
            REFERENCES "app_user"("id_user") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE TABLE "notification" (
                "id_notification" SERIAL NOT NULL,
                "notification_type" VARCHAR(50),
                "message" TEXT NOT NULL,
                "is_read" BOOLEAN NOT NULL DEFAULT false,
                "id_user" INTEGER NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_notification" PRIMARY KEY ("id_notification"),
                CONSTRAINT "CHK_notification_type" CHECK ("notification_type" IN ('info', 'alert', 'reminder', 'message', 'system', 'other'))
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_notification_user" ON "notification" ("id_user")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notification_read" ON "notification" ("is_read")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notification_created" ON "notification" ("created_at")`,
    );

    await queryRunner.query(`
            ALTER TABLE "notification" 
            ADD CONSTRAINT "FK_notification_user" 
            FOREIGN KEY ("id_user") 
            REFERENCES "app_user"("id_user") 
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.updated_at = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql
        `);

    await queryRunner.query(`
            CREATE TRIGGER update_app_user_updated_at 
            BEFORE UPDATE ON "app_user"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);

    await queryRunner.query(`
            CREATE TRIGGER update_project_updated_at 
            BEFORE UPDATE ON "expatriation_project"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);

    await queryRunner.query(`
            CREATE TRIGGER update_guide_updated_at 
            BEFORE UPDATE ON "guide"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);

    await queryRunner.query(`
            CREATE TRIGGER update_checklist_updated_at 
            BEFORE UPDATE ON "checklist"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);

    await queryRunner.query(`
            CREATE TRIGGER update_process_updated_at 
            BEFORE UPDATE ON "administrative_process"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);

    await queryRunner.query(`
            CREATE TRIGGER update_tracking_updated_at 
            BEFORE UPDATE ON "process_tracking"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);

    await queryRunner.query(`
            CREATE TRIGGER update_experience_updated_at 
            BEFORE UPDATE ON "experience"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);

    await queryRunner.query(`
            CREATE TRIGGER update_topic_updated_at 
            BEFORE UPDATE ON "forum_topic"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);

    await queryRunner.query(`
            CREATE TRIGGER update_message_updated_at 
            BEFORE UPDATE ON "forum_message"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "notification" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "forum_message" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "forum_topic" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "experience" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "city_comparison" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "job_offer" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "business_sector" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "cost_of_living" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "process_tracking" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "administrative_process" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "resource" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "checklist" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "guide" CASCADE`);
    await queryRunner.query(
      `DROP TABLE IF EXISTS "expatriation_project" CASCADE`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "app_user" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "city" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "country" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "continent" CASCADE`);

    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE`,
    );
  }
}
