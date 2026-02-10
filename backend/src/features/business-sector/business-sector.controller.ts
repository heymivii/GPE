import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { BusinessSectorService } from './business-sector.service';
import { CreateBusinessSectorDto } from './dto/create-business-sector.dto';
import { UpdateBusinessSectorDto } from './dto/update-business-sector.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Business Sector')
@Controller('business-sector')
export class BusinessSectorController {
  constructor(private readonly businessSectorService: BusinessSectorService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateBusinessSectorDto) {
    return this.businessSectorService.create(createDto);
  }

  @Get()
  findAll() {
    return this.businessSectorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.businessSectorService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateDto: UpdateBusinessSectorDto) {
    return this.businessSectorService.update(+id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.businessSectorService.remove(+id);
  }
}
