import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminProcedureService } from './admin-procedure.service';
import { AdminProcedureGeneratorService } from './admin-procedure-generator.service';
import { CreateAdminProcedureDto } from './dto/create-admin-procedure.dto';
import { UpdateAdminProcedureDto } from './dto/update-admin-procedure.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminLogService } from '../admin-log/admin-log.service';

import { assertGenerationEnabled } from '../gov-links/generation-flag';
@ApiTags('Admin Procedure')
@Controller('admin-procedure')
export class AdminProcedureController {
  constructor(
    private readonly adminProcedureService: AdminProcedureService,
    private readonly adminProcedureGeneratorService: AdminProcedureGeneratorService,
    private readonly adminLogService: AdminLogService,
  ) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async generateFromGovLinks(@Query('country') country: string, @Request() req) {
    assertGenerationEnabled();
    const procedures = await this.adminProcedureGeneratorService.generateFromGovLinks(country);
    await this.adminLogService.log(
      req.user.userId,
      'GENERATE',
      'AdminProcedure',
      country,
      `Génération de ${procedures.length} démarche(s) depuis gov_links pour ${country}`,
    );
    return procedures;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async create(@Body() createAdminProcedureDto: CreateAdminProcedureDto, @Request() req) {
    const procedure = await this.adminProcedureService.create(createAdminProcedureDto);
    await this.adminLogService.log(
      req.user.userId,
      'CREATE',
      'AdminProcedure',
      procedure.idAdminProcedure.toString(),
      `Création de la démarche "${procedure.procedureType}"`
    );
    return procedure;
  }

  @Get()
  findAll(@Query('countryId') countryId?: string) {
    if (countryId) {
      return this.adminProcedureService.findByCountry(+countryId);
    }
    return this.adminProcedureService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminProcedureService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateAdminProcedureDto: UpdateAdminProcedureDto,
    @Request() req,
  ) {
    const procedure = await this.adminProcedureService.update(+id, updateAdminProcedureDto);
    await this.adminLogService.log(
      req.user.userId,
      'UPDATE',
      'AdminProcedure',
      procedure.idAdminProcedure.toString(),
      `Modification de la démarche "${procedure.procedureType}"`
    );
    return procedure;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string, @Request() req) {
    const procedure = await this.adminProcedureService.findOne(+id);
    await this.adminProcedureService.remove(+id);
    await this.adminLogService.log(
      req.user.userId,
      'DELETE',
      'AdminProcedure',
      id,
      `Suppression de la démarche "${procedure.procedureType}"`
    );
  }
}
