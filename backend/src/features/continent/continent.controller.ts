import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContinentService } from './continent.service';
import { CreateContinentDto } from './dto/create-continent.dto';
import { UpdateContinentDto } from './dto/update-continent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Continent')
@Controller('continent')
export class ContinentController {
  constructor(private readonly continentService: ContinentService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createContinentDto: CreateContinentDto) {
    return this.continentService.create(createContinentDto);
  }

  @Get()
  findAll() {
    return this.continentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.continentService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateContinentDto: UpdateContinentDto) {
    return this.continentService.update(+id, updateContinentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.continentService.remove(+id);
  }
}
