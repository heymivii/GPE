import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminProcedureService } from './admin-procedure.service';
import { CreateAdminProcedureDto } from './dto/create-admin-procedure.dto';
import { UpdateAdminProcedureDto } from './dto/update-admin-procedure.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin Procedure')
@Controller('admin-procedure')
export class AdminProcedureController {
  constructor(private readonly adminProcedureService: AdminProcedureService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createAdminProcedureDto: CreateAdminProcedureDto) {
    return this.adminProcedureService.create(createAdminProcedureDto);
  }

  @Get()
  findAll() {
    return this.adminProcedureService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminProcedureService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateAdminProcedureDto: UpdateAdminProcedureDto) {
    return this.adminProcedureService.update(+id, updateAdminProcedureDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.adminProcedureService.remove(+id);
  }
}
