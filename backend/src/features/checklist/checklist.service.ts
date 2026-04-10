import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checklist } from './entities/checklist.entity';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto } from './dto/update-checklist.dto';

@Injectable()
export class ChecklistService {
  constructor(
    @InjectRepository(Checklist)
    private readonly checklistRepository: Repository<Checklist>,
  ) {}

  async create(createDto: CreateChecklistDto): Promise<Checklist> {
    const checklist = this.checklistRepository.create({
      title: createDto.title,
      steps: createDto.steps,
      country: { id: createDto.countryId } as any,
    });
    return await this.checklistRepository.save(checklist);
  }

  async findAll(): Promise<Checklist[]> {
    return await this.checklistRepository.find({
      relations: ['country'],
    });
  }

  async findByCountry(countryId: number): Promise<Checklist[]> {
    return await this.checklistRepository.find({
      where: { country: { id: countryId } },
      relations: ['country'],
    });
  }

  async findOne(id: number): Promise<Checklist> {
    const checklist = await this.checklistRepository.findOne({
      where: { id },
      relations: ['country'],
    });
    if (!checklist) {
      throw new NotFoundException(`Checklist with ID ${id} not found`);
    }
    return checklist;
  }

  async update(id: number, updateDto: UpdateChecklistDto): Promise<Checklist> {
    const checklist = await this.findOne(id);
    Object.assign(checklist, updateDto);
    return await this.checklistRepository.save(checklist);
  }

  async remove(id: number): Promise<void> {
    const checklist = await this.findOne(id);
    await this.checklistRepository.remove(checklist);
  }
}
