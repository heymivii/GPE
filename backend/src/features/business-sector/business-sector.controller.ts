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
} from '@nestjs/common';
import { BusinessSectorService } from './business-sector.service';
import { CreateBusinessSectorDto } from './dto/create-business-sector.dto';
import { UpdateBusinessSectorDto } from './dto/update-business-sector.dto';

@Controller('business-sector')
export class BusinessSectorController {
  constructor(private readonly businessSectorService: BusinessSectorService) {}

  @Post()
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
  update(@Param('id') id: string, @Body() updateDto: UpdateBusinessSectorDto) {
    return this.businessSectorService.update(+id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.businessSectorService.remove(+id);
  }
}
