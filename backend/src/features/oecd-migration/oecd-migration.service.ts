import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';


export interface MigrationIndicator {
  countryCode: string;
  measure: 'B11' | 'B12' | 'B13' | 'B15' | 'B16';
  year: number;
  value: number;
}

export interface CountryMigrationData {
  countryCode: string;
  countryName: string;
  inflowsForeignPop?: { value: number; year: number };
  outflowsForeignPop?: { value: number; year: number };
  asylumSeekers?: { value: number; year: number };
  stocksForeignPop?: { value: number; year: number };
  nationalityAcquisitions?: { value: number; year: number };
}

const MEASURE_LABELS: Record<string, string> = {
  B11: 'Inflows of foreign population',
  B12: 'Outflows of foreign population',
  B13: 'Inflows of asylum seekers',
  B15: 'Stocks of foreign population',
  B16: 'Acquisitions of nationality',
};

const ISO2_TO_ISO3: Record<string, string> = {
  FR: 'FRA',
  CH: 'CHE',
  JP: 'JPN',
  US: 'USA',
};

const ISO3_TO_NAME: Record<string, string> = {
  FRA: 'France',
  CHE: 'Switzerland',
  JPN: 'Japan',
  USA: 'United States',
};

const SUPPORTED_ISO3 = ['FRA', 'CHE', 'JPN', 'USA'];
const MEASURES = ['B11', 'B12', 'B13', 'B15', 'B16'];
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class OecdMigrationService {
  private readonly logger = new Logger(OecdMigrationService.name);

  private cache: CountryMigrationData[] | null = null;
  private cacheTimestamp = 0;

  async getMigrationData(): Promise<CountryMigrationData[]> {
    if (this.cache && Date.now() - this.cacheTimestamp < CACHE_TTL_MS) {
      return this.cache;
    }

    try {
      const data = await this.fetchFromOecd();
      this.cache = data;
      this.cacheTimestamp = Date.now();
      return data;
    } catch (error) {
      this.logger.error('Failed to fetch OECD migration data', error);
      if (this.cache) return this.cache;
      return SUPPORTED_ISO3.map(code => ({
        countryCode: code,
        countryName: ISO3_TO_NAME[code] || code,
      }));
    }
  }

  async getByCountry(code: string): Promise<CountryMigrationData | null> {
    const iso3 = code.length === 2 ? ISO2_TO_ISO3[code.toUpperCase()] : code.toUpperCase();
    if (!iso3) return null;

    const all = await this.getMigrationData();
    return all.find(d => d.countryCode === iso3) || null;
  }


  private async fetchFromOecd(): Promise<CountryMigrationData[]> {
    const countriesParam = SUPPORTED_ISO3.join('+');
    const measuresParam = MEASURES.join('+');

    const url =
      `https://sdmx.oecd.org/public/rest/data/OECD.ELS.IMD,DSD_MIG@DF_MIG,1.0/` +
      `${countriesParam}.W.A.${measuresParam}._T._Z._Z..` +
      `?startPeriod=2018&endPeriod=2025`;

    this.logger.log(`Fetching OECD migration data: ${url}`);

    const response = await axios.get(url, {
      headers: { Accept: 'application/vnd.sdmx.data+json' },
      timeout: 15_000,
    });

    return this.parseSdmxJson(response.data);
  }

  private parseSdmxJson(raw: any): CountryMigrationData[] {
    const struct = raw.data.structures[0];
    const dimsSeries = struct.dimensions.series;
    const dimsObs = struct.dimensions.observation;

    const countries: string[] = dimsSeries.find((d: any) => d.id === 'REF_AREA')?.values.map((v: any) => v.id) || [];
    const measures: string[] = dimsSeries.find((d: any) => d.id === 'MEASURE')?.values.map((v: any) => v.id) || [];
    const years: string[] = dimsObs.find((d: any) => d.id === 'TIME_PERIOD')?.values.map((v: any) => v.id) || [];

    const refAreaIdx = dimsSeries.findIndex((d: any) => d.id === 'REF_AREA');
    const measureIdx = dimsSeries.findIndex((d: any) => d.id === 'MEASURE');

    const ds = raw.data.dataSets[0];

    const latest: Record<string, MigrationIndicator> = {};

    for (const [seriesKey, seriesVal] of Object.entries(ds.series) as any) {
      const parts = seriesKey.split(':').map(Number);
      const countryCode = countries[parts[refAreaIdx]];
      const measure = measures[parts[measureIdx]];

      if (!countryCode || !measure) continue;

      for (const [timeIdx, obs] of Object.entries((seriesVal as any).observations) as any) {
        const year = parseInt(years[parseInt(timeIdx)], 10);
        const value = obs[0];

        if (value == null || value <= 0) continue;

        const key = `${countryCode}|${measure}`;
        if (!latest[key] || year > latest[key].year) {
          latest[key] = {
            countryCode,
            measure: measure as MigrationIndicator['measure'],
            year,
            value,
          };
        }
      }
    }

    return SUPPORTED_ISO3.map(iso3 => {
      const get = (m: string) => latest[`${iso3}|${m}`];
      const toEntry = (m: string) => {
        const d = get(m);
        return d ? { value: d.value, year: d.year } : undefined;
      };

      return {
        countryCode: iso3,
        countryName: ISO3_TO_NAME[iso3] || iso3,
        inflowsForeignPop: toEntry('B11'),
        outflowsForeignPop: toEntry('B12'),
        asylumSeekers: toEntry('B13'),
        stocksForeignPop: toEntry('B15'),
        nationalityAcquisitions: toEntry('B16'),
      };
    });
  }
}
