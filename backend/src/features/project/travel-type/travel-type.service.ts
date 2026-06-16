import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TravelType } from './travel-type.entity';
import { CreateTravelTypeDto } from './dto/create-travel-type.dto';

@Injectable()
export class TravelTypeService {
  constructor(
    @InjectRepository(TravelType)
    private readonly travelTypeRepository: Repository<TravelType>,
  ) {}

  async create(createDto: CreateTravelTypeDto): Promise<TravelType> {
    const travelType = this.travelTypeRepository.create(createDto);
    return await this.travelTypeRepository.save(travelType);
  }

  async findAll(): Promise<TravelType[]> {
    return await this.travelTypeRepository.find();
  }

  async findOne(id: number): Promise<TravelType> {
    const travelType = await this.travelTypeRepository.findOne({
      where: { idTravelType: id },
    });
    if (!travelType) {
      throw new NotFoundException(`Travel type with ID ${id} not found`);
    }
    return travelType;
  }

  async remove(id: number): Promise<void> {
    const travelType = await this.findOne(id);
    await this.travelTypeRepository.remove(travelType);
  }
}
