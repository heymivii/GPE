import { Injectable } from '@nestjs/common';
import { CreateCostOfLivingDto } from './dto/create-cost-of-living.dto';
import { UpdateCostOfLivingDto } from './dto/update-cost-of-living.dto';

@Injectable()
export class CostOfLivingService {
  create(createCostOfLivingDto: CreateCostOfLivingDto) {
    return 'This action adds a new costOfLiving';
  }

  findAll() {
    return `This action returns all costOfLiving`;
  }

  findOne(id: number) {
    return `This action returns a #${id} costOfLiving`;
  }

  update(id: number, updateCostOfLivingDto: UpdateCostOfLivingDto) {
    return `This action updates a #${id} costOfLiving`;
  }

  remove(id: number) {
    return `This action removes a #${id} costOfLiving`;
  }
}
