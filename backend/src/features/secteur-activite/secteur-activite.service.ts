import { Injectable } from '@nestjs/common';
import { CreateSecteurActiviteDto } from './dto/create-secteur-activite.dto';
import { UpdateSecteurActiviteDto } from './dto/update-secteur-activite.dto';

@Injectable()
export class SecteurActiviteService {
  create(createSecteurActiviteDto: CreateSecteurActiviteDto) {
    return 'This action adds a new secteurActivite';
  }

  findAll() {
    return `This action returns all secteurActivite`;
  }

  findOne(id: number) {
    return `This action returns a #${id} secteurActivite`;
  }

  update(id: number, updateSecteurActiviteDto: UpdateSecteurActiviteDto) {
    return `This action updates a #${id} secteurActivite`;
  }

  remove(id: number) {
    return `This action removes a #${id} secteurActivite`;
  }
}
