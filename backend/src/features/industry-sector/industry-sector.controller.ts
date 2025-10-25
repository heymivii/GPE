import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { IndustrySectorService } from './industry-sector.service';
import { CreateIndustrySectorDto } from './dto/create-industry-sector.dto';
import { UpdateIndustrySectorDto } from './dto/update-industry-sector.dto';

@Controller('industry-sector')
export class IndustrySectorController {
  constructor(private readonly industrySectorService: IndustrySectorService) {}

  @Post()
  create(@Body() createIndustrySectorDto: CreateIndustrySectorDto) {
    return this.industrySectorService.create(createIndustrySectorDto);
  }

  @Get()
  findAll() {
    return this.industrySectorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.industrySectorService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateIndustrySectorDto: UpdateIndustrySectorDto,
  ) {
    return this.industrySectorService.update(+id, updateIndustrySectorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.industrySectorService.remove(+id);
  }
}
