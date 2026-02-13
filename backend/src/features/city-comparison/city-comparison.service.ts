import { Injectable } from '@nestjs/common';
import { CreateCityComparisonDto } from './dto/create-city-comparison.dto';
import { UpdateCityComparisonDto } from './dto/update-city-comparison.dto';

@Injectable()
export class CityComparisonService {
  create(_createCityComparisonDto: CreateCityComparisonDto) {
    return 'This action adds a new cityComparison';
  }

  findAll() {
    return `This action returns all cityComparison`;
  }

  findOne(id: number) {
    return `This action returns a #${id} cityComparison`;
  }

  update(id: number, _updateCityComparisonDto: UpdateCityComparisonDto) {
    return `This action updates a #${id} cityComparison`;
  }

  remove(id: number) {
    return `This action removes a #${id} cityComparison`;
  }
}
