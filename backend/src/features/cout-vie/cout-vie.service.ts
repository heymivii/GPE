import { Injectable } from '@nestjs/common';
import { CreateCoutVieDto } from './dto/create-cout-vie.dto';
import { UpdateCoutVieDto } from './dto/update-cout-vie.dto';

@Injectable()
export class CoutVieService {
  create(createCoutVieDto: CreateCoutVieDto) {
    return 'This action adds a new coutVie';
  }

  findAll() {
    return `This action returns all coutVie`;
  }

  findOne(id: number) {
    return `This action returns a #${id} coutVie`;
  }

  update(id: number, updateCoutVieDto: UpdateCoutVieDto) {
    return `This action updates a #${id} coutVie`;
  }

  remove(id: number) {
    return `This action removes a #${id} coutVie`;
  }
}
