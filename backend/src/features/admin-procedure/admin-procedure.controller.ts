import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdminProcedureService } from './admin-procedure.service';
import { CreateAdminProcedureDto } from './dto/create-admin-procedure.dto';
import { UpdateAdminProcedureDto } from './dto/update-admin-procedure.dto';

@Controller('admin-procedure')
export class AdminProcedureController {
  constructor(private readonly adminProcedureService: AdminProcedureService) {}

  @Post()
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
  update(@Param('id') id: string, @Body() updateAdminProcedureDto: UpdateAdminProcedureDto) {
    return this.adminProcedureService.update(+id, updateAdminProcedureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminProcedureService.remove(+id);
  }
}
