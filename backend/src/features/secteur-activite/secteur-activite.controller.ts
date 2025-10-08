import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SecteurActiviteService } from './secteur-activite.service';
import { CreateSecteurActiviteDto } from './dto/create-secteur-activite.dto';
import { UpdateSecteurActiviteDto } from './dto/update-secteur-activite.dto';

@Controller('secteur-activite')
export class SecteurActiviteController {
  constructor(private readonly secteurActiviteService: SecteurActiviteService) {}

  @Post()
  create(@Body() createSecteurActiviteDto: CreateSecteurActiviteDto) {
    return this.secteurActiviteService.create(createSecteurActiviteDto);
  }

  @Get()
  findAll() {
    return this.secteurActiviteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.secteurActiviteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSecteurActiviteDto: UpdateSecteurActiviteDto) {
    return this.secteurActiviteService.update(+id, updateSecteurActiviteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.secteurActiviteService.remove(+id);
  }
}
