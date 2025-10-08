import { Injectable } from '@nestjs/common';
import { CreateVilleDto } from './dto/create-ville.dto';
import { UpdateVilleDto } from './dto/update-ville.dto';

@Injectable()
export class VilleService {
  create(createVilleDto: CreateVilleDto) {
    return 'This action adds a new ville';
  }

  findAll() {
    return `This action returns all ville`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ville`;
  }

  update(id: number, updateVilleDto: UpdateVilleDto) {
    return `This action updates a #${id} ville`;
  }

  remove(id: number) {
    return `This action removes a #${id} ville`;
  }
}
