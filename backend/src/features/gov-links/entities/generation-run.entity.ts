import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Lifecycle of a per-country generation run (the front polls this row). */
export type GenerationRunStatus = 'running' | 'done' | 'failed';

/** Rich per-category review outcome — distinct from gov_link.status (which stays {active|needs_review|dead}). */
export type GenerationCategoryResult = 'verified' | 'needs_review' | 'failed';

/**
 * One entry per category. Pre-filled for ALL categories at run creation with `result: null`
 * (= not yet processed → UI shows ⏳). The enum stays pure (3 verdicts); "no verdict yet" is `null`,
 * a lifecycle state, NOT an enum value. The orchestrator fills it in when the category completes.
 */
export interface GenerationRunResultItem {
  category: string;
  result: GenerationCategoryResult | null; // null = pending (not yet processed)
  url: string | null;
  confidence: number | null;
  message: string | null;
}

/**
 * A "Generate (per country)" run. Fire-and-forget in-process; this DB row is the source of truth
 * the admin UI polls. `results` is updated category-by-category while `status === 'running'`.
 */
@Entity({ name: 'generation_run' })
export class GenerationRun {
  @PrimaryGeneratedColumn({ name: 'id_generation_run' })
  id: number;

  @Column({ name: 'country_code', type: 'varchar', length: 2 })
  countryCode: string;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'running' })
  status: GenerationRunStatus;

  /** Number of categories to process (= CANONICAL_CATEGORIES.length). */
  @Column({ name: 'total', type: 'int', default: 0 })
  total: number;

  /** Per-category review results (jsonb array), appended/updated as each category completes. */
  @Column({ name: 'results', type: 'jsonb', default: () => "'[]'" })
  results: GenerationRunResultItem[];

  @Column({ name: 'started_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt: Date;

  @Column({ name: 'finished_at', type: 'timestamp', nullable: true })
  finishedAt?: Date;
}
