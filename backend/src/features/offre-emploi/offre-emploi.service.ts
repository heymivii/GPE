import { Injectable } from '@nestjs/common';
import { CreateOffreEmploiDto } from './dto/create-offre-emploi.dto';
import { UpdateOffreEmploiDto } from './dto/update-offre-emploi.dto';

@Injectable()
export class OffreEmploiService {
  create(createOffreEmploiDto: CreateOffreEmploiDto) {
    return 'This action adds a new offreEmploi';
  }

  findAll() {
    return `This action returns all offreEmploi`;
  }

  findOne(id: number) {
    return `This action returns a #${id} offreEmploi`;
  }

  update(id: number, updateOffreEmploiDto: UpdateOffreEmploiDto) {
    return `This action updates a #${id} offreEmploi`;
  }

  remove(id: number) {
    return `This action removes a #${id} offreEmploi`;
  }
}
