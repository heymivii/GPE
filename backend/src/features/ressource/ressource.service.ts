import { Injectable } from '@nestjs/common';
import { CreateRessourceDto } from './dto/create-ressource.dto';
import { UpdateRessourceDto } from './dto/update-ressource.dto';

@Injectable()
export class RessourceService {
  create(createRessourceDto: CreateRessourceDto) {
    return 'This action adds a new ressource';
  }

  findAll() {
    return `This action returns all ressource`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ressource`;
  }

  update(id: number, updateRessourceDto: UpdateRessourceDto) {
    return `This action updates a #${id} ressource`;
  }

  remove(id: number) {
    return `This action removes a #${id} ressource`;
  }
}
