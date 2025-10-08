import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OffreEmploiService } from './offre-emploi.service';
import { CreateOffreEmploiDto } from './dto/create-offre-emploi.dto';
import { UpdateOffreEmploiDto } from './dto/update-offre-emploi.dto';

@Controller('offre-emploi')
export class OffreEmploiController {
  constructor(private readonly offreEmploiService: OffreEmploiService) {}

  @Post()
  create(@Body() createOffreEmploiDto: CreateOffreEmploiDto) {
    return this.offreEmploiService.create(createOffreEmploiDto);
  }

  @Get()
  findAll() {
    return this.offreEmploiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.offreEmploiService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOffreEmploiDto: UpdateOffreEmploiDto) {
    return this.offreEmploiService.update(+id, updateOffreEmploiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.offreEmploiService.remove(+id);
  }
}
