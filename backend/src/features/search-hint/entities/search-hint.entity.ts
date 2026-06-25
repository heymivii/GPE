import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Editable "search address book": ONE row per (countryCode, category) telling the gov-links engine
 * WHERE/HOW to search — official domains to target, the real admin keywords, the query language,
 * terms to exclude, and an optional manual `pinnedUrl` override (engine skips search if set).
 *
 * Matches the shape of SEARCH_HINTS_SEED (search-hints.seed.ts). Admin-editable (CRUD).
 */
@Entity({ name: 'search_hint' })
@Unique('UQ_search_hint_country_cat', ['countryCode', 'category'])
export class SearchHint {
  @PrimaryGeneratedColumn({ name: 'id_search_hint' })
  id: number;

  @Column({ name: 'country_code', type: 'varchar', length: 2 })
  countryCode: string;

  @Column({ name: 'category', type: 'varchar', length: 50 })
  category: string;

  /** Official domains to target (`site:<domain> …`). */
  @Column({ name: 'official_domains', type: 'jsonb', default: () => "'[]'" })
  officialDomains: string[];

  /** The real administrative search terms (free text, not generic words). */
  @Column({ name: 'keywords', type: 'text', default: '' })
  keywords: string;

  /** Language to query in (fr / en / ja / de …). */
  @Column({ name: 'query_lang', type: 'varchar', length: 5, default: 'fr' })
  queryLang: string;

  /** Traps to exclude from the search (`-term`). */
  @Column({ name: 'exclude_terms', type: 'jsonb', default: () => "'[]'" })
  excludeTerms: string[];

  /** Manual override: if set, the engine skips the search and uses this link directly. */
  @Column({ name: 'pinned_url', type: 'text', nullable: true })
  pinnedUrl: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
