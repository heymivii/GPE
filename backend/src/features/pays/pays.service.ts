import { Injectable } from '@nestjs/common';
import { CreatePayDto } from './dto/create-pay.dto';
import { UpdatePayDto } from './dto/update-pay.dto';

@Injectable()
export class PaysService {
  create(createPayDto: CreatePayDto) {
    return 'This action adds a new pay';
  }

  findAll() {
    return `This action returns all pays`;
  }

  findOne(id: number) {
    return `This action returns a #${id} pay`;
  }

  update(id: number, updatePayDto: UpdatePayDto) {
    return `This action updates a #${id} pay`;
  }

  remove(id: number) {
    return `This action removes a #${id} pay`;
  }
}
