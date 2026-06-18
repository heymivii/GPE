import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from './entities/city.entity';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import restCountriesService from '../../services/restCountries.service';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
  ) {}

  async create(createCityDto: CreateCityDto): Promise<City> {
    const city = this.cityRepository.create({
      name: createCityDto.name,
      latitude: createCityDto.latitude?.toString(),
      longitude: createCityDto.longitude?.toString(),
      population: createCityDto.population,
      timezone: createCityDto.timezone,
      isCapital: createCityDto.isCapital ?? false,
      imageUrl: createCityDto.imageUrl,
      status: createCityDto.status ?? 'active',
      countryId: createCityDto.countryId,
    });
    return await this.cityRepository.save(city);
  }

  async findAll(status?: string): Promise<City[]> {
    return await this.cityRepository.find({
      relations: ['country'],
      ...(status !== undefined && { where: { status: status as 'active' | 'archived' } }),
    });
  }

  // Reference list of cities of a country (free, no key — via countriesnow), for admin pickers.
  async getAvailableCities(country: string): Promise<string[]> {
    if (!country) {
      return [];
    }
    return restCountriesService.getCitiesByCountry(country);
  }

  async findByCountry(countryId: number, status?: string): Promise<City[]> {
    return await this.cityRepository.find({
      where: {
        countryId,
        ...(status !== undefined && { status: status as 'active' | 'archived' }),
      },
    });
  }

  async findOne(id: number): Promise<City> {
    const city = await this.cityRepository.findOne({
      where: { idCity: id },
      relations: ['country'],
    });
    if (!city) {
      throw new NotFoundException(`Ville avec l'ID ${id} introuvable`);
    }
    return city;
  }

  async update(id: number, updateCityDto: UpdateCityDto): Promise<City> {
    const city = await this.findOne(id);
    Object.assign(city, updateCityDto);
    return await this.cityRepository.save(city);
  }

  async remove(id: number): Promise<void> {
    const city = await this.findOne(id);
    await this.cityRepository.remove(city);
  }
}
