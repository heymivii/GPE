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

  // ✅ Reprise ici
  let offset = 19540;
  const limit = 10;
  let totalCount = 0;
  let totalImported = offset;

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  console.log(`🚀 Starting import at offset ${offset} with limit ${limit}`);

  do {
    console.log(`📡 Requesting cities: offset=${offset}, limit=${limit}`);

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
      totalCount = response.data.metadata.totalCount;

      console.log(`✅ Received ${cities.length} cities | Total count: ${totalCount}`);

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

      console.log(`💾 Saving ${cityEntities.length} cities to database...`);

      await this.cityRepository.save(cityEntities);

      totalImported += cityEntities.length;

      console.log(`🎯 Progress: ${totalImported}/${totalCount}`);

      offset += limit;

      console.log(`⏳ Waiting 2 sec before next request...`);
      await sleep(2000);

    } catch (error) {
      console.error('❌ Axios Error:', error.response?.data || error.message);

      if (error.response?.status === 429) {
        console.log('⚠️ Too many requests. Waiting 1 minute before retry...');
        await sleep(60_000);
      } else {
        console.error('🛑 Unexpected error, aborting.');
        throw error;
      }
    }

  } while (offset < totalCount);

  console.log(`🎉 Import finished! Total cities imported: ${totalImported}`);

  return {
    message: `🎉 Import finished! ${totalImported} cities imported.`,
    totalImported,
  };
}

}
