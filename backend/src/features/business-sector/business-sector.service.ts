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
    private readonly sectorRepository: Repository<BusinessSector>,
  ) {}

  async create(createDto: CreateBusinessSectorDto): Promise<BusinessSector> {
    const sector = this.sectorRepository.create(createDto);
    return await this.sectorRepository.save(sector);
  }

  async findAll(): Promise<BusinessSector[]> {
    return await this.sectorRepository.find();
  }

  async findOne(id: number): Promise<BusinessSector> {
    const sector = await this.sectorRepository.findOne({
      where: { idSector: id },
    });

    if (!sector) {
      throw new NotFoundException(`Business sector with ID ${id} not found`);
    }

    return sector;
  }

  async update(
    id: number,
    updateDto: UpdateBusinessSectorDto,
  ): Promise<BusinessSector> {
    const sector = await this.findOne(id);
    Object.assign(sector, updateDto);
    return await this.sectorRepository.save(sector);
  }

  async remove(id: number): Promise<void> {
    const sector = await this.findOne(id);
    await this.sectorRepository.remove(sector);
  }
}
