import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SearchHint } from './entities/search-hint.entity';
import { SEARCH_HINTS_SEED } from './search-hints.seed';
import { CreateSearchHintDto } from './dto/create-search-hint.dto';
import { UpdateSearchHintDto } from './dto/update-search-hint.dto';

@Injectable()
export class SearchHintService {
  constructor(
    @InjectRepository(SearchHint)
    private readonly repo: Repository<SearchHint>,
  ) {}

  async list(filter: { countryCode?: string; category?: string } = {}): Promise<SearchHint[]> {
    const where: Record<string, string> = {};
    if (filter.countryCode) where.countryCode = filter.countryCode.toUpperCase();
    if (filter.category) where.category = filter.category;
    return this.repo.find({ where, order: { countryCode: 'ASC', category: 'ASC' } });
  }

  async findOne(countryCode: string, category: string): Promise<SearchHint> {
    const hint = await this.findOneOrNull(countryCode, category);
    if (!hint) {
      throw new NotFoundException(`Fiche de recherche ${countryCode}/${category} introuvable`);
    }
    return hint;
  }

  /**
   * Non-throwing read used by the gov-links engine: returns the fiche or null.
   * Generation must NEVER fail just because no address-book entry exists (fallback is mandatory).
   */
  async findOneOrNull(countryCode: string, category: string): Promise<SearchHint | null> {
    return this.repo.findOne({
      where: { countryCode: countryCode.toUpperCase(), category },
    });
  }

  async create(dto: CreateSearchHintDto): Promise<SearchHint> {
    const countryCode = dto.countryCode.toUpperCase();
    const existing = await this.repo.findOne({ where: { countryCode, category: dto.category } });
    if (existing) {
      throw new ConflictException(`Une fiche ${countryCode}/${dto.category} existe déjà`);
    }
    return this.repo.save(
      this.repo.create({
        countryCode,
        category: dto.category,
        officialDomains: dto.officialDomains ?? [],
        keywords: dto.keywords ?? '',
        queryLang: dto.queryLang ?? 'fr',
        excludeTerms: dto.excludeTerms ?? [],
        pinnedUrl: dto.pinnedUrl ?? null,
      }),
    );
  }

  async update(countryCode: string, category: string, dto: UpdateSearchHintDto): Promise<SearchHint> {
    const hint = await this.findOne(countryCode, category);
    Object.assign(hint, dto); // only the provided editable fields
    return this.repo.save(hint);
  }

  async remove(countryCode: string, category: string): Promise<void> {
    const hint = await this.findOne(countryCode, category);
    await this.repo.remove(hint);
  }

  /**
   * INSERT-ONLY seeding: inserts the (countryCode, category) combos from SEARCH_HINTS_SEED that are
   * missing. NEVER overwrites an existing row → manual edits and pinnedUrl overrides are protected
   * even if re-seeded. Idempotent: a second call inserts nothing.
   */
  async seedMissing(): Promise<{ inserted: number; skipped: number; total: number }> {
    const existing = await this.repo.find();
    const seen = new Set(existing.map((h) => `${h.countryCode}::${h.category}`));
    const toInsert = SEARCH_HINTS_SEED.filter(
      (s) => !seen.has(`${s.countryCode.toUpperCase()}::${s.category}`),
    ).map((s) =>
      this.repo.create({
        countryCode: s.countryCode.toUpperCase(),
        category: s.category,
        officialDomains: s.officialDomains,
        keywords: s.keywords,
        queryLang: s.queryLang,
        excludeTerms: s.excludeTerms,
        pinnedUrl: s.pinnedUrl,
      }),
    );
    if (toInsert.length) await this.repo.save(toInsert);
    return {
      inserted: toInsert.length,
      skipped: SEARCH_HINTS_SEED.length - toInsert.length,
      total: SEARCH_HINTS_SEED.length,
    };
  }
}
