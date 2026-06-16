import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import slugify from 'slugify';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { City } from '../city/entities/city.entity';
import { Country } from '../country/entities/country.entity';
import { ForumTopic } from '../forum-topic/entities/forum-topic.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { Resource } from '../resource/entities/resource.entity';
import { CostOfLivingService } from '../cost-of-living/cost-of-living.service';
import { AdzunaService } from '../job-offer/adzuna.service';

const COUNTRY_IMAGES: Record<string, string> = {
  France:
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  Canada:
    'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=800&q=80',
  Suisse:
    'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=800&q=80',
  Allemagne:
    'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
  Espagne:
    'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80',
  Italie:
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80',
  Portugal:
    'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80',
  Belgique:
    'https://images.unsplash.com/photo-1559113513-d5e09c78b9dd?auto=format&fit=crop&w=800&q=80',
  'Pays-Bas':
    'https://images.unsplash.com/photo-1534351590666-13e3e96b5571?auto=format&fit=crop&w=800&q=80',
  Luxembourg:
    'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80',
  'Royaume-Uni':
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  Irlande:
    'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=800&q=80',
  'États-Unis':
    'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
  Australie:
    'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
  'Nouvelle-Zélande':
    'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
  Japon:
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
  Singapour:
    'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
  'Émirats arabes unis':
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  Mexique:
    'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=800&q=80',
  Brésil:
    'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';

const ISO_TO_ADZUNA: Record<string, string> = {
  FR: 'fr',
  GB: 'gb',
  US: 'us',
  CA: 'ca',
  DE: 'de',
  AT: 'at',
  AU: 'au',
  BE: 'be',
  BR: 'br',
  CH: 'ch',
  IN: 'in',
  IT: 'it',
  MX: 'mx',
  NL: 'nl',
  NZ: 'nz',
  PL: 'pl',
  SG: 'sg',
  ZA: 'za',
  RU: 'ru',
  ES: 'es',
};

@Injectable()
export class DestinationsService {
  private readonly logger = new Logger(DestinationsService.name);

  constructor(
    @InjectRepository(City)
    private readonly cityRepository: Repository<City>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(ForumTopic)
    private readonly forumTopicRepository: Repository<ForumTopic>,
    @InjectRepository(ExpatriationProject)
    private readonly expatriationProjectRepository: Repository<ExpatriationProject>,
    @InjectRepository(Resource)
    private readonly resourceRepository: Repository<Resource>,
    private readonly costOfLivingService: CostOfLivingService,
    private readonly adzunaService: AdzunaService,
  ) {}

  async findAll() {
    return this.cityRepository.find({
      where: {},
      relations: ['country'],
      order: {
        name: 'ASC',
      },
    });
  }

  async findAllEnriched() {
    return this.cityRepository
      .createQueryBuilder('city')
      .leftJoinAndSelect('city.country', 'country')
      .orderBy('city.name', 'ASC')
      .getMany();
  }

  async findAllCountries() {
    const countries = await this.countryRepository
      .createQueryBuilder('country')
      .leftJoinAndSelect('country.continent', 'continent')
      .orderBy('country.name', 'ASC')
      .getMany();

    const [forumCounts, projectCounts, resourceCounts] = await Promise.all([
      this.forumTopicRepository
        .createQueryBuilder('ft')
        .innerJoin('ft.country', 'c')
        .select('c.id_country', 'countryId')
        .addSelect('COUNT(*)', 'count')
        .groupBy('c.id_country')
        .getRawMany<{ countryId: number; count: string }>(),

      this.expatriationProjectRepository
        .createQueryBuilder('ep')
        .select('ep.destination_country_id', 'countryId')
        .addSelect('COUNT(*)', 'count')
        .groupBy('ep.destination_country_id')
        .getRawMany<{ countryId: number; count: string }>(),

      this.resourceRepository
        .createQueryBuilder('r')
        .innerJoin('r.country', 'c2')
        .select('c2.id_country', 'countryId')
        .addSelect('COUNT(*)', 'count')
        .groupBy('c2.id_country')
        .getRawMany<{ countryId: number; count: string }>(),
    ]);

    const adzunaJobCounts =
      await this.getAdzunaJobCountsForCountries(countries);

    const forumMap = new Map(
      forumCounts.map((r) => [Number(r.countryId), Number(r.count)]),
    );
    const projectMap = new Map(
      projectCounts.map((r) => [Number(r.countryId), Number(r.count)]),
    );
    const resourceMap = new Map(
      resourceCounts.map((r) => [Number(r.countryId), Number(r.count)]),
    );

    return countries.map((country) => ({
      ...country,
      imageUrl: COUNTRY_IMAGES[country.countryName] || DEFAULT_IMAGE,
      stats: {
        memberCount: projectMap.get(country.idCountry) || 0,
        jobOffersCount: adzunaJobCounts.get(country.idCountry) || 0,
        forumTopicsCount: forumMap.get(country.idCountry) || 0,
        resourcesCount: resourceMap.get(country.idCountry) || 0,
      },
    }));
  }

  private async getAdzunaJobCountsForCountries(
    countries: Country[],
  ): Promise<Map<number, number>> {
    const jobCountMap = new Map<number, number>();

    const promises = countries.map(async (country) => {
      const adzunaCode = country.isoCode
        ? ISO_TO_ADZUNA[country.isoCode.toUpperCase()]
        : undefined;
      if (!adzunaCode) {
        jobCountMap.set(country.idCountry, 0);
        return;
      }
      try {
        const response = await this.adzunaService.searchJobs({
          country: adzunaCode,
          resultsPerPage: 1,
          page: 1,
        });
        jobCountMap.set(country.idCountry, response.total);
      } catch (error) {
        this.logger.warn(
          `⚠️  Adzuna count failed for ${country.countryName} (${adzunaCode}): ${error instanceof Error ? error.message : error}`,
        );
        jobCountMap.set(country.idCountry, 0);
      }
    });

    await Promise.all(promises);
    return jobCountMap;
  }

  async findOneCountryBySlug(slug: string) {
    let country;
    if (slug.length === 2) {
      country = await this.countryRepository.findOne({
        where: { isoCode: slug.toUpperCase() },
      });
    } else {
      country = await this.countryRepository.findOne({
        where: { countryName: slug },
      });

      if (!country) {
        const allCountries = await this.countryRepository.find();
        country = allCountries.find(
          (c) =>
            slugify(c.countryName, { lower: true, strict: true }) ===
              slug.toLowerCase() ||
            c.countryName.toLowerCase() === slug.toLowerCase() ||
            c.countryName.toLowerCase().replace(/ /g, '-') ===
              slug.toLowerCase(),
        );
      }
    }

    if (!country) {
      throw new NotFoundException(`Country with slug "${slug}" not found`);
    }

    const cities = await this.cityRepository.find({
      where: { countryId: country.idCountry },
      order: { name: 'ASC' },
    });

    const citiesWithCost = await Promise.all(
      cities.map(async (city) => {
        const cachedCostData =
          await this.costOfLivingService.getCachedDataByCityId(city.idCity);
        return {
          ...city,
          imageUrl:
            city.imageUrl ||
            'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=800&q=80',
          costOfLiving: cachedCostData,
        };
      }),
    );

    let totalRent = 0;
    let count = 0;
    citiesWithCost.forEach((c) => {
      const avgRent =
        c.costOfLiving?.categories?.housing?.rent?.oneBedroom?.cityCenter?.avg;
      if (avgRent) {
        totalRent += avgRent;
        count++;
      }
    });
    const averageHousingCost =
      count > 0 ? (totalRent / count).toFixed(2) : null;

    const adzunaCode = country.isoCode
      ? ISO_TO_ADZUNA[country.isoCode.toUpperCase()]
      : undefined;

    const [forumTopicsCount, memberCount, jobOffersCount, resourcesCount] =
      await Promise.all([
        this.forumTopicRepository.count({
          where: { country: { idCountry: country.idCountry } },
        }),
        this.expatriationProjectRepository.count({
          where: { destinationCountryId: country.idCountry },
        }),
        adzunaCode
          ? this.adzunaService
              .searchJobs({ country: adzunaCode, resultsPerPage: 1, page: 1 })
              .then((r) => r.total)
              .catch(() => 0)
          : Promise.resolve(0),
        this.resourceRepository.count({
          where: { country: { idCountry: country.idCountry } },
        }),
      ]);

    return {
      ...country,
      imageUrl: COUNTRY_IMAGES[country.countryName] || DEFAULT_IMAGE,
      cities: citiesWithCost,
      costOfLiving: {
        averageHousing: averageHousingCost,
      },
      stats: {
        memberCount,
        jobOffersCount,
        forumTopicsCount,
        resourcesCount,
      },
    };
  }

  async findOneBySlug(slug: string) {
    // Note: slug column removed from City to match Drawio.
    // Falling back to search by name for this method.
    const destination = await this.cityRepository.findOne({
      where: { name: slug },
      relations: ['country'],
    });

    if (!destination) {
      throw new NotFoundException(`Destination "${slug}" not found`);
    }

    return destination;
  }
}
