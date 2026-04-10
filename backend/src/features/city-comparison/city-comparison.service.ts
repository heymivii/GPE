import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CityComparison } from './entities/city-comparison.entity';
import { CreateCityComparisonDto } from './dto/create-city-comparison.dto';

@Injectable()
export class CityComparisonService {
  constructor(
    @InjectRepository(CityComparison)
    private readonly cityComparisonRepository: Repository<CityComparison>,
  ) {}

  async create(userId: number, createDto: CreateCityComparisonDto): Promise<CityComparison> {
    const comparison = this.cityComparisonRepository.create({
      user: { id: userId } as any,
      city: { id: createDto.cityId } as any,
    });
    return await this.cityComparisonRepository.save(comparison);
  }

  async findAllByUser(userId: number): Promise<CityComparison[]> {
    return await this.cityComparisonRepository.find({
      where: { user: { id: userId } },
      relations: ['city', 'city.country'],
    });
  }

  async findOne(id: number): Promise<CityComparison> {
    const comparison = await this.cityComparisonRepository.findOne({
      where: { id },
      relations: ['city', 'city.country', 'user'],
    });
    if (!comparison) {
      throw new NotFoundException(`City comparison with ID ${id} not found`);
    }
    return comparison;
  }

  async remove(id: number): Promise<void> {
    const comparison = await this.findOne(id);
    await this.cityComparisonRepository.remove(comparison);
  }
}
