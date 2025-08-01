import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { Continent } from '../continent/entities/continent.entity';
import fetch from 'node-fetch';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
    @InjectRepository(Continent)
    private continentRepository: Repository<Continent>,
  ) {}

  async create(data: Partial<Country>): Promise<Country> {
    const country = this.countryRepository.create(data);
    return this.countryRepository.save(country);
  }

  async findAll(): Promise<Country[]> {
    return this.countryRepository.find({ relations: ['continent'] });
  }

  async importFromApiRestCountries(): Promise<void> {
    const response1 = await fetch(
      'https://restcountries.com/v3.1/all?fields=name,altSpellings,currencies,languages,flags,maps,continents,capital',
    );
    const response2 = await fetch(
      'https://restcountries.com/v3.1/all?fields=name,subregion,latlng,area,population',
    );

    const data1 = await response1.json();
    const data2 = await response2.json();

    const countriesMap = new Map();

    for (const country of data1) {
      countriesMap.set(country.name.common, { ...country });
    }

    for (const country of data2) {
      if (countriesMap.has(country.name.common)) {
        Object.assign(countriesMap.get(country.name.common), country);
      }
    }

    for (const countryData of countriesMap.values()) {
      const continentName = countryData.continents?.[0] || null;
      let continent = null;

      if (continentName) {
        continent = await this.continentRepository.findOne({
          where: { name: continentName },
        });
      }

      const newCountry = this.countryRepository.create({
        name: countryData.name?.common || null,
        isoCode: countryData.altSpellings?.[0] || null,
        currency: Object.keys(countryData.currencies || {})[0] || null,
        languages: countryData.languages || null,
        flag: countryData.flags?.png || null,
        mapsUrl: countryData.maps?.googleMaps || null,
        visaInfoUrl: null,
        capital: countryData.capital?.[0] || null,
        subregion: countryData.subregion || null,
        latitude: countryData.latlng?.[0] || null,
        longitude: countryData.latlng?.[1] || null,
        area: countryData.area || null,
        population: countryData.population || null,
        continent: continent || null,
      });

      await this.countryRepository.save(newCountry);
    }
  }
}
