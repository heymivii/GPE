import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OecdMigrationService } from './oecd-migration.service';

@ApiTags('OECD Migration')
@Controller('migration')
export class OecdMigrationController {
  constructor(private readonly service: OecdMigrationService) {}

  /**
   * GET /api/migration
   * Returns OECD migration data for all supported countries.
   */
  @Get()
  findAll() {
    return this.service.getMigrationData();
  }

  /**
   * GET /api/migration/:code
   * Returns OECD migration data for one country (ISO-2 or ISO-3 code).
   * Example: /api/migration/FR  or  /api/migration/FRA
   */
  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.service.getByCountry(code);
  }
}
