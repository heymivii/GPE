import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OecdMigrationService } from './oecd-migration.service';

@ApiTags('OECD Migration')
@Controller('migration')
export class OecdMigrationController {
  constructor(private readonly service: OecdMigrationService) {}

  @Get()
  findAll() {
    return this.service.getMigrationData();
  }

  @Get(':code')
  findOne(@Param('code') code: string) {
    return this.service.getByCountry(code);
  }
}
