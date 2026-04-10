import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VisaRequirement } from './visa-requirement.entity';
import { CreateVisaRequirementDto } from './dto/create-visa-requirement.dto';

@Injectable()
export class VisaRequirementService {
  constructor(
    @InjectRepository(VisaRequirement)
    private readonly visaRequirementRepository: Repository<VisaRequirement>,
  ) {}

  async create(createDto: CreateVisaRequirementDto): Promise<VisaRequirement> {
    const visa = this.visaRequirementRepository.create({
      ...createDto,
      originCountry: { id: createDto.originCountryId } as any,
      destinationCountry: { id: createDto.destinationCountryId } as any,
    });
    return await this.visaRequirementRepository.save(visa);
  }

  async findAll(): Promise<VisaRequirement[]> {
    return await this.visaRequirementRepository.find({
      relations: ['originCountry', 'destinationCountry'],
    });
  }

  async findByCountries(originId: number, destinationId: number): Promise<VisaRequirement[]> {
    return await this.visaRequirementRepository.find({
      where: {
        originCountry: { id: originId },
        destinationCountry: { id: destinationId },
      },
      relations: ['originCountry', 'destinationCountry'],
    });
  }

  async findOne(id: number): Promise<VisaRequirement> {
    const visa = await this.visaRequirementRepository.findOne({
      where: { id },
      relations: ['originCountry', 'destinationCountry'],
    });
    if (!visa) {
      throw new NotFoundException(`Visa requirement with ID ${id} not found`);
    }
    return visa;
  }

  async remove(id: number): Promise<void> {
    const visa = await this.findOne(id);
    await this.visaRequirementRepository.remove(visa);
  }
}
