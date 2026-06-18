import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminProcedure } from './entities/admin-procedure.entity';
import { GovLink } from '../gov-links/entities/gov-link.entity';
import { Country } from '../country/entities/country.entity';

/** Days before departure default per category. */
export const DAYS_BEFORE_DEPARTURE_MAP: Record<string, number> = {
  visa: 120,
  demarches: 90,
  'demarches-admin': 90,
  logement: 60,
  sante: 45,
  emploi: 90,
  banque: 30,
  transport: 60,
};

/** Step order per category. */
export const STEP_ORDER_MAP: Record<string, number> = {
  visa: 1,
  demarches: 2,
  'demarches-admin': 2,
  logement: 3,
  sante: 4,
  emploi: 5,
  banque: 6,
  transport: 7,
};

/**
 * Category → objectives filter.
 * Empty array means "applies to everyone" (no filter).
 * Real objective values stored on expatriation_project.objective: 'work' | 'study'
 */
export const CATEGORY_OBJECTIVES_MAP: Record<string, string[]> = {
  visa: [],
  demarches: [],
  'demarches-admin': [],
  logement: [],
  sante: [],
  banque: [],
  transport: [],
  emploi: ['work'],
  education: ['study'],
};

function defaultDaysBeforeDeparture(category: string): number {
  return DAYS_BEFORE_DEPARTURE_MAP[category] ?? 60;
}

function defaultStepOrder(category: string): number {
  return STEP_ORDER_MAP[category] ?? 10;
}

function objectivesForCategory(category: string): string[] {
  return CATEGORY_OBJECTIVES_MAP[category] ?? [];
}

@Injectable()
export class AdminProcedureGeneratorService {
  constructor(
    @InjectRepository(AdminProcedure)
    private readonly adminProcedureRepository: Repository<AdminProcedure>,
    @InjectRepository(GovLink)
    private readonly govLinkRepository: Repository<GovLink>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) {}

  /**
   * Upsert admin_procedures from active gov_links for the given ISO2 country code.
   * Keyed on (country_id, category) — updates existing, creates missing.
   */
  async generateFromGovLinks(countryCode: string): Promise<AdminProcedure[]> {
    const country = await this.countryRepository.findOne({
      where: { isoCode: countryCode },
    });
    if (!country) {
      throw new NotFoundException(
        `Country with ISO code "${countryCode}" not found`,
      );
    }

    const govLinks = await this.govLinkRepository.find({
      where: { countryCode, status: 'active' },
    });

    const results: AdminProcedure[] = [];

    for (const link of govLinks) {
      const category = link.category;

      // Try to find existing procedure for this country + category
      let procedure = await this.adminProcedureRepository.findOne({
        where: { country: { idCountry: country.idCountry }, category },
        relations: ['country'],
      });

      const fields: Partial<AdminProcedure> = {
        procedureType: link.label,
        description: link.summary?.[0] ?? `Démarche officielle : ${category}`,
        category,
        sourceUrl: link.url,
        keyFacts: link.summary ?? [],
        objectives: objectivesForCategory(category),
        daysBeforeDeparture: defaultDaysBeforeDeparture(category),
        stepOrder: defaultStepOrder(category),
      };

      if (procedure) {
        Object.assign(procedure, fields);
      } else {
        procedure = this.adminProcedureRepository.create({
          ...fields,
          country,
        });
      }

      const saved = await this.adminProcedureRepository.save(procedure);
      results.push(saved);
    }

    return results;
  }
}
