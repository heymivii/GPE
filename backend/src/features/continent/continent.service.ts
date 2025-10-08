import { Injectable } from '@nestjs/common';
import { CreateContinentDto } from './dto/create-continent.dto';
import { UpdateContinentDto } from './dto/update-continent.dto';

@Injectable()
export class ContinentService {
  create(createContinentDto: CreateContinentDto) {
    return 'This action adds a new continent';
  }

  findAll() {
    return `This action returns all continent`;
  }

  findOne(id: number) {
    return `This action returns a #${id} continent`;
  }

  update(id: number, updateContinentDto: UpdateContinentDto) {
    return `This action updates a #${id} continent`;
  }

  remove(id: number) {
    return `This action removes a #${id} continent`;
  }
}
