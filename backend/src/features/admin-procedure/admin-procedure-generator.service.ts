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
  culture: 30,
  business: 60,
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
  business: 8,
  culture: 9,
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
  // business is work-adjacent but applies regardless of work objective (e.g. freelancer
  // arriving under a long-stay visa). Keep empty to include for all expats.
  business: [],
  culture: [],
};

/**
 * French display title per category — used as procedureType in admin_procedure.
 * Never derived from the gov_link label (which may be English or arbitrary).
 */
export const CATEGORY_FR_TITLE_MAP: Record<string, string> = {
  visa: 'Visa & entrée',
  demarches: 'Titre de séjour',
  'demarches-admin': 'Démarches administratives',
  logement: 'Logement',
  sante: 'Assurance maladie & santé',
  emploi: 'Travail & emploi',
  banque: 'Compte bancaire',
  transport: 'Transport & permis de conduire',
  education: 'Études',
  culture: 'Vie culturelle',
  business: 'Créer une entreprise',
};

/**
 * Phase per category:
 *   'before'     → must be handled before departure
 *   'on_arrival' → handled once arrived in the destination country
 */
export const CATEGORY_PHASE_MAP: Record<string, 'before' | 'on_arrival'> = {
  visa: 'before',
  demarches: 'on_arrival',
  'demarches-admin': 'on_arrival',
  logement: 'on_arrival',
  sante: 'on_arrival',
  emploi: 'on_arrival',
  banque: 'on_arrival',
  transport: 'on_arrival',
  education: 'on_arrival',
  culture: 'on_arrival',
  business: 'on_arrival',
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

function frTitleForCategory(category: string): string {
  return CATEGORY_FR_TITLE_MAP[category] ?? category.charAt(0).toUpperCase() + category.slice(1);
}

function phaseForCategory(category: string): 'before' | 'on_arrival' {
  return CATEGORY_PHASE_MAP[category] ?? 'on_arrival';
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
   *
   * Cascade archive: after upserting, any country procedure whose category has NO active gov_link
   * is archived (status='archived') so it is hidden from the checklist. Non-destructive — rows,
   * procedure_tracking rows, and progress are preserved; re-verified → re-activates on next run.
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
        // French category title — never the raw gov_link label (avoids English/arbitrary strings)
        procedureType: frTitleForCategory(category),
        description: link.summary?.[0] ?? `Démarche officielle : ${category}`,
        category,
        sourceUrl: link.url,
        keyFacts: link.summary ?? [],
        actionItems: link.actions ?? [],
        objectives: objectivesForCategory(category),
        daysBeforeDeparture: defaultDaysBeforeDeparture(category),
        stepOrder: defaultStepOrder(category),
        phase: phaseForCategory(category),
        status: 'active',
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

    // Cascade archive: procedures whose category has no active gov_link become 'archived'.
    const activeCategories = govLinks.map((l) => l.category);
    if (activeCategories.length > 0) {
      // Archive procedures that are NOT in the active-category set.
      await this.adminProcedureRepository
        .createQueryBuilder()
        .update(AdminProcedure)
        .set({ status: 'archived' })
        .where('country_id = :countryId', { countryId: country.idCountry })
        .andWhere('category NOT IN (:...activeCategories)', { activeCategories })
        .execute();
    } else {
      // No active gov_links at all → archive everything for this country.
      await this.adminProcedureRepository
        .createQueryBuilder()
        .update(AdminProcedure)
        .set({ status: 'archived' })
        .where('country_id = :countryId', { countryId: country.idCountry })
        .execute();
    }

    return results;
  }
}
