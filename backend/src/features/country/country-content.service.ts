import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CountryContent } from './entities/country-content.entity';
import { CreateCountryContentDto } from './dto/create-country-content.dto';
import { UpdateCountryContentDto } from './dto/update-country-content.dto';

@Injectable()
export class CountryContentService {
  constructor(
    @InjectRepository(CountryContent)
    private readonly countryContentRepository: Repository<CountryContent>,
  ) {}

  async create(createDto: CreateCountryContentDto): Promise<CountryContent> {
    const content = this.countryContentRepository.create({
      ...createDto,
      country: { idCountry: createDto.countryId } as any,
    });
    return await this.countryContentRepository.save(content);
  }

  async findAll(): Promise<CountryContent[]> {
    return await this.countryContentRepository.find({
      relations: ['country'],
    });
  }

  async findByCountry(countryId: number): Promise<CountryContent[]> {
    return await this.countryContentRepository.find({
      where: { country: { idCountry: countryId } },
      relations: ['country'],
    });
  }

  async findOne(id: number): Promise<CountryContent> {
    const content = await this.countryContentRepository.findOne({
      where: { idCountryContent: id },
      relations: ['country'],
    });
    if (!content) {
      throw new NotFoundException(`Country content with ID ${id} not found`);
    }
    return content;
  }

  async update(id: number, updateDto: UpdateCountryContentDto): Promise<CountryContent> {
    const content = await this.findOne(id);
    Object.assign(content, updateDto);
    return await this.countryContentRepository.save(content);
  }

  async remove(id: number): Promise<void> {
    const content = await this.findOne(id);
    await this.countryContentRepository.remove(content);
  }
}
