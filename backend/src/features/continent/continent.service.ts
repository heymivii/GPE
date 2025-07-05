import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Continent } from './entities/continent.entity';

@Injectable()
export class ContinentService {
  constructor(
    @InjectRepository(Continent)
    private continentRepository: Repository<Continent>,
  ) {}

  create(name: string, isoCode: string): Promise<Continent> {
    const continent = this.continentRepository.create({ name, isoCode });
    return this.continentRepository.save(continent);
  }

  findAll(): Promise<Continent[]> {
    return this.continentRepository.find();
  }
}
