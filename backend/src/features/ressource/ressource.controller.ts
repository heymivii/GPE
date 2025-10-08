import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RessourceService } from './ressource.service';
import { CreateRessourceDto } from './dto/create-ressource.dto';
import { UpdateRessourceDto } from './dto/update-ressource.dto';

@Controller('ressource')
export class RessourceController {
  constructor(private readonly ressourceService: RessourceService) {}

  @Post()
  create(@Body() createRessourceDto: CreateRessourceDto) {
    return this.ressourceService.create(createRessourceDto);
  }

  @Get()
  findAll() {
    return this.ressourceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ressourceService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRessourceDto: UpdateRessourceDto) {
    return this.ressourceService.update(+id, updateRessourceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ressourceService.remove(+id);
  }
}
