import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Experience } from './entities/experience.entity';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { UpdateExperienceDto } from './dto/update-experience.dto';

@Injectable()
export class ExperienceService {
  constructor(
    @InjectRepository(Experience)
    private readonly experienceRepository: Repository<Experience>,
  ) {}

  async create(userId: number, createDto: CreateExperienceDto): Promise<Experience> {
    const experience = this.experienceRepository.create({
      ...createDto,
      user: { id: userId } as any,
      country: { id: createDto.countryId } as any,
    });
    return await this.experienceRepository.save(experience);
  }

  async findAll(): Promise<Experience[]> {
    return await this.experienceRepository.find({
      relations: ['user', 'country'],
    });
  }

  async findByCountry(countryId: number): Promise<Experience[]> {
    return await this.experienceRepository.find({
      where: { country: { id: countryId } },
      relations: ['user', 'country'],
    });
  }

  async findOne(id: number): Promise<Experience> {
    const experience = await this.experienceRepository.findOne({
      where: { id },
      relations: ['user', 'country'],
    });
    if (!experience) {
      throw new NotFoundException(`Experience with ID ${id} not found`);
    }
    return experience;
  }

  async update(id: number, updateDto: UpdateExperienceDto): Promise<Experience> {
    const experience = await this.findOne(id);
    Object.assign(experience, updateDto);
    return await this.experienceRepository.save(experience);
  }

  async remove(id: number): Promise<void> {
    const experience = await this.findOne(id);
    await this.experienceRepository.remove(experience);
  }
}
