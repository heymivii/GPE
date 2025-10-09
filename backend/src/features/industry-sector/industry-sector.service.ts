import { Injectable } from '@nestjs/common';
import { CreateIndustrySectorDto } from './dto/create-industry-sector.dto';
import { UpdateIndustrySectorDto } from './dto/update-industry-sector.dto';

@Injectable()
export class IndustrySectorService {
  create(createIndustrySectorDto: CreateIndustrySectorDto) {
    return 'This action adds a new industrySector';
  }

  findAll() {
    return `This action returns all industrySector`;
  }

  findOne(id: number) {
    return `This action returns a #${id} industrySector`;
  }

  update(id: number, updateIndustrySectorDto: UpdateIndustrySectorDto) {
    return `This action updates a #${id} industrySector`;
  }

  remove(id: number) {
    return `This action removes a #${id} industrySector`;
  }
}
