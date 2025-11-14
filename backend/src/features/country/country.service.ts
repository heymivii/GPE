import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  async create(createDto: CreateCountryDto): Promise<Country> {
    const country = this.countryRepository.create(createDto);
    return await this.countryRepository.save(country);
  }

  async findAll(): Promise<Country[]> {
    return await this.countryRepository.find({
      relations: ['continent'],
    });
  }

  async findOne(id: number): Promise<Country> {
    const country = await this.countryRepository.findOne({
      where: { idCountry: id },
      relations: ['continent'],
    });

    if (!country) {
      throw new NotFoundException(`Country with ID ${id} not found`);
    }

    return country;
  }

  async update(id: number, updateDto: UpdateCountryDto): Promise<Country> {
    const country = await this.findOne(id);
    Object.assign(country, updateDto);
    return await this.countryRepository.save(country);
  }

  async remove(id: number): Promise<void> {
    const country = await this.findOne(id);
    await this.countryRepository.remove(country);
  }
}
