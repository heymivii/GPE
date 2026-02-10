import { Module } from '@nestjs/common';
import { OecdMigrationController } from './oecd-migration.controller';
import { OecdMigrationService } from './oecd-migration.service';

@Module({
  controllers: [OecdMigrationController],
  providers: [OecdMigrationService],
  exports: [OecdMigrationService],
})
export class OecdMigrationModule {}
