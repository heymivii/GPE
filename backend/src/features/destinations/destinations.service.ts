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

// Photo de couverture par code ISO.
//
// Cette table était indexée par nom de pays en français. Les lignes de la base
// portant un nom anglais (« Japan », « Switzerland », « United States ») ne
// trouvaient donc aucune clé et recevaient toutes la même image par défaut, ce
// qui donnait des cartes identiques côté Explorer (retour de recette).
// Le code ISO, lui, ne dépend pas de la langue de saisie.
const COUNTRY_IMAGES_BY_ISO: Record<string, string> = {
  // France
  FR: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
  // Canada
  CA: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=800&q=80',
  // Suisse
  CH: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=800&q=80',
  // Allemagne
  DE: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=800&q=80',
  // Espagne
  ES: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?auto=format&fit=crop&w=800&q=80',
  // Italie
  IT: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=800&q=80',
  // Portugal
  PT: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=800&q=80',
  // Belgique
  BE: 'https://images.unsplash.com/photo-1559113513-d5e09c78b9dd?auto=format&fit=crop&w=800&q=80',
  // Pays-Bas
  NL: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5571?auto=format&fit=crop&w=800&q=80',
  // Luxembourg
  LU: 'https://images.unsplash.com/photo-1587974928442-77dc3e0dba72?auto=format&fit=crop&w=800&q=80',
  // Royaume-Uni
  GB: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=800&q=80',
  // Irlande
  IE: 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?auto=format&fit=crop&w=800&q=80',
  // États-Unis
  US: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80',
  // Australie
  AU: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=800&q=80',
  // Nouvelle-Zélande
  NZ: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?auto=format&fit=crop&w=800&q=80',
  // Japon
  JP: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
  // Singapour
  SG: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?auto=format&fit=crop&w=800&q=80',
  // Émirats arabes unis
  AE: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  // Mexique
  MX: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?auto=format&fit=crop&w=800&q=80',
  // Brésil
  BR: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=800&q=80',
};


// Filet de sécurité pour les lignes dont iso_code est vide : on reconnaît le nom
// dans les deux langues de saisie rencontrées en base.
const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  france: 'FR',
  canada: 'CA',
  suisse: 'CH',
  switzerland: 'CH',
  allemagne: 'DE',
  germany: 'DE',
  espagne: 'ES',
  spain: 'ES',
  italie: 'IT',
  italy: 'IT',
  portugal: 'PT',
  belgique: 'BE',
  belgium: 'BE',
  'pays-bas': 'NL',
  netherlands: 'NL',
  luxembourg: 'LU',
  'royaume-uni': 'GB',
  'united kingdom': 'GB',
  irlande: 'IE',
  ireland: 'IE',
  'états-unis': 'US',
  'etats-unis': 'US',
  'united states': 'US',
  australie: 'AU',
  australia: 'AU',
  'nouvelle-zélande': 'NZ',
  'new zealand': 'NZ',
  japon: 'JP',
  japan: 'JP',
  singapour: 'SG',
  singapore: 'SG',
  'émirats arabes unis': 'AE',
  'united arab emirates': 'AE',
  mexique: 'MX',
  mexico: 'MX',
  brésil: 'BR',
  brazil: 'BR',
};

/**
 * Photo de couverture d'un pays.
 * Priorité au code ISO ; on retombe sur le nom pour les lignes dont l'ISO
 * n'est pas renseigné en base.
 */
function countryImage(country: { isoCode?: string | null; countryName?: string | null }): string {
  const byIso = country.isoCode
    ? COUNTRY_IMAGES_BY_ISO[country.isoCode.toUpperCase()]
    : undefined;
  if (byIso) return byIso;
  const iso = country.countryName
    ? COUNTRY_NAME_TO_ISO[country.countryName.trim().toLowerCase()]
    : undefined;
  return (iso && COUNTRY_IMAGES_BY_ISO[iso]) || DEFAULT_IMAGE;
}

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
      // Ne jamais exposer les pays archivés : la liste des destinations reflète
      // uniquement les pays actifs de l'admin (source de vérité unique).
      .where('country.status = :status', { status: 'active' })
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
      imageUrl: countryImage(country),
      stats: {
        memberCount: projectMap.get(country.idCountry) || 0,
        jobOffersCount: adzunaJobCounts.get(country.idCountry) ?? null,
        forumTopicsCount: forumMap.get(country.idCountry) || 0,
        resourcesCount: resourceMap.get(country.idCountry) || 0,
      },
    }));
  }

  /**
   * Nombre d'offres Adzuna par pays.
   *
   * `null` signifie « pays hors couverture Adzuna » (le Japon, par exemple, n'a
   * pas d'endpoint chez eux), à ne pas confondre avec un vrai 0. Sans cette
   * distinction la carte affichait « 0 emplois » pour le Japon, ce qui laissait
   * croire à une absence d'offres plutôt qu'à une absence de source.
   */
  private async getAdzunaJobCountsForCountries(
    countries: Country[],
  ): Promise<Map<number, number | null>> {
    const jobCountMap = new Map<number, number | null>();

    const promises = countries.map(async (country) => {
      const adzunaCode = country.isoCode
        ? ISO_TO_ADZUNA[country.isoCode.toUpperCase()]
        : undefined;
      if (!adzunaCode) {
        jobCountMap.set(country.idCountry, null);
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
        // Un appel raté n'est pas une absence d'offres.
        jobCountMap.set(country.idCountry, null);
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

    // Seules les villes VALIDÉES sont publiques. Le pays était déjà filtré sur
    // `status = 'active'` mais pas ses villes : la page destination affichait
    // aussi bien les villes archivées que celles encore en attente de
    // vérification (les 5 villes du Japon étaient archivées, et « Bretagne »,
    // en attente de revue, était visible de tous).
    const cities = await this.cityRepository.find({
      where: { countryId: country.idCountry, status: 'active' },
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
              .then((r): number | null => r.total)
              .catch(() => null)
          : Promise.resolve(null),
        this.resourceRepository.count({
          where: { country: { idCountry: country.idCountry } },
        }),
      ]);

    return {
      ...country,
      imageUrl: countryImage(country),
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
