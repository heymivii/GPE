import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Continent } from './entities/continent.entity';
import { CreateContinentDto } from './dto/create-continent.dto';
import { UpdateContinentDto } from './dto/update-continent.dto';

@Injectable()
export class ContinentService {
  constructor(
    @InjectRepository(Continent)
    private readonly continentRepository: Repository<Continent>,
  ) {}

  async create(createDto: CreateContinentDto): Promise<Continent> {
    const continent = this.continentRepository.create(createDto);
    return await this.continentRepository.save(continent);
  }

  async findAll(): Promise<Continent[]> {
    return await this.continentRepository.find();
  }

  async findOne(id: number): Promise<Continent> {
    const continent = await this.continentRepository.findOne({
      where: { idContinent: id },
    });

    if (!continent) {
      throw new NotFoundException(`Continent with ID ${id} not found`);
    }

    return continent;
  }

  async update(id: number, updateDto: UpdateContinentDto): Promise<Continent> {
    const continent = await this.findOne(id);
    Object.assign(continent, updateDto);
    return await this.continentRepository.save(continent);
  }

  async remove(id: number): Promise<void> {
    const continent = await this.findOne(id);
    await this.continentRepository.remove(continent);
  }
}
