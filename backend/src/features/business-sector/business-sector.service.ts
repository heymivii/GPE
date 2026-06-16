import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessSector } from './entities/business-sector.entity';
import { CreateBusinessSectorDto } from './dto/create-business-sector.dto';
import { UpdateBusinessSectorDto } from './dto/update-business-sector.dto';

@Injectable()
export class BusinessSectorService {
  constructor(
    @InjectRepository(BusinessSector)
    private readonly businessSectorRepository: Repository<BusinessSector>,
  ) {}

  async create(createDto: CreateBusinessSectorDto): Promise<BusinessSector> {
    const sector = this.businessSectorRepository.create(createDto);
    return await this.businessSectorRepository.save(sector);
  }

  async findAll(): Promise<BusinessSector[]> {
    return await this.businessSectorRepository.find();
  }

  async findOne(id: number): Promise<BusinessSector> {
    const sector = await this.businessSectorRepository.findOne({
      where: { idBusinessSector: id },
    });
    if (!sector) {
      throw new NotFoundException(`Business sector with ID ${id} not found`);
    }
    return sector;
  }

  async update(id: number, updateDto: UpdateBusinessSectorDto): Promise<BusinessSector> {
    const sector = await this.findOne(id);
    Object.assign(sector, updateDto);
    return await this.businessSectorRepository.save(sector);
  }

  async remove(id: number): Promise<void> {
    const sector = await this.findOne(id);
    await this.businessSectorRepository.remove(sector);
  }
}
