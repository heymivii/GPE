import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guide } from './entities/guide.entity';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';

@Injectable()
export class GuideService {
  constructor(
    @InjectRepository(Guide)
    private readonly guideRepository: Repository<Guide>,
  ) {}

  async create(createDto: CreateGuideDto): Promise<Guide> {
    const guide = this.guideRepository.create({
      ...createDto,
      country: { id: createDto.countryId } as any,
    });
    return await this.guideRepository.save(guide);
  }

  async findAll(): Promise<Guide[]> {
    return await this.guideRepository.find({
      relations: ['country'],
    });
  }

  async findByCountry(countryId: number): Promise<Guide[]> {
    return await this.guideRepository.find({
      where: { country: { id: countryId } },
      relations: ['country'],
    });
  }

  async findOne(id: number): Promise<Guide> {
    const guide = await this.guideRepository.findOne({
      where: { id },
      relations: ['country'],
    });
    if (!guide) {
      throw new NotFoundException(`Guide with ID ${id} not found`);
    }
    return guide;
  }

  async update(id: number, updateDto: UpdateGuideDto): Promise<Guide> {
    const guide = await this.findOne(id);
    Object.assign(guide, updateDto);
    return await this.guideRepository.save(guide);
  }

  async remove(id: number): Promise<void> {
    const guide = await this.findOne(id);
    await this.guideRepository.remove(guide);
  }
}
