import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CoutVieService } from './cout-vie.service';
import { CreateCoutVieDto } from './dto/create-cout-vie.dto';
import { UpdateCoutVieDto } from './dto/update-cout-vie.dto';

@Controller('cout-vie')
export class CoutVieController {
  constructor(private readonly coutVieService: CoutVieService) {}

  @Post()
  create(@Body() createCoutVieDto: CreateCoutVieDto) {
    return this.coutVieService.create(createCoutVieDto);
  }

  @Get()
  findAll() {
    return this.coutVieService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coutVieService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoutVieDto: UpdateCoutVieDto) {
    return this.coutVieService.update(+id, updateCoutVieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coutVieService.remove(+id);
  }
}
