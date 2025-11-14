import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContinentService } from './continent.service';
import { CreateContinentDto } from './dto/create-continent.dto';
import { UpdateContinentDto } from './dto/update-continent.dto';

@Controller('continent')
export class ContinentController {
  constructor(private readonly continentService: ContinentService) {}

  @Post()
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
  update(@Param('id') id: string, @Body() updateContinentDto: UpdateContinentDto) {
    return this.continentService.update(+id, updateContinentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.continentService.remove(+id);
  }
}
