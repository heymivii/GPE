import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import * as https from 'https';
import { City } from './entities/city.entity';

@Injectable()
export class CityService {
  constructor(
    @InjectRepository(City)
    private cityRepository: Repository<City>,
  ) {}

  async findAll(): Promise<City[]> {
    return this.cityRepository.find();
  }

  async create(data: Partial<City>): Promise<City> {
    const city = this.cityRepository.create(data);
    return this.cityRepository.save(city);
  }

  async importCitiesFromGeoDb(): Promise<{
    message: string;
    totalImported: number;
  }> {
    const headers = {
      'X-RapidAPI-Key': 'aa81c51695msh90375fad163b55fp1bd0c4jsn23ae1f2996e5',
      'X-RapidAPI-Host': 'wft-geo-db.p.rapidapi.com',
      'User-Agent': 'RapidAPI-Node',
    };

    let offset = 0;
    const limit = 10;
    let totalCount = 0;
    let totalImported = 0;

    do {
      try {
        const response = await axios.get(
          'https://wft-geo-db.p.rapidapi.com/v1/geo/cities',
          {
            headers,
            params: { offset, limit },
            decompress: true,
          },
        );

        const cities = response.data.data;
        const sleep = (ms: number) =>
          new Promise((resolve) => setTimeout(resolve, ms));

        // 🗃️ Prépare un tableau d'entités
        const cityEntities: City[] = cities.map((c: any) =>
          this.cityRepository.create({
            name: c.name,
            countryCode: c.countryCode,
            region: c.region,
            latitude: c.latitude,
            longitude: c.longitude,
            population: c.population,
          }),
        );

        // ⚡ Sauvegarde en batch
        await this.cityRepository.save(cityEntities);

        totalImported += cityEntities.length;

        totalCount = response.data.metadata.totalCount;

        console.log(`✅ Imported ${totalImported}/${totalCount}`);

        offset += limit;
        await sleep(2000);
      } catch (error) {
        console.error('❌ Axios Error:', error.response?.data || error.message);
        throw error;
      }
    } while (offset < totalCount);

    return {
      message: `🎉 Import finished! ${totalImported} cities imported.`,
      totalImported,
    };
  }
}
