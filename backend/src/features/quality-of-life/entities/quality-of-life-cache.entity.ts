import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Persistent cache for Numbeo Quality of Life indices, keyed by English country
// name. DB-backed (not in-memory) so scrapes survive restarts and are shared across
// instances — this is what limits how often we hit Numbeo (anti-ban + provenance).
@Entity({ name: 'quality_of_life_cache' })
export class QualityOfLifeCache {
  @PrimaryGeneratedColumn({ name: 'id_quality_of_life_cache' })
  idCache: number;

  @Column({ name: 'country', type: 'varchar', length: 100, unique: true })
  country: string;

  @Column({ name: 'data', type: 'jsonb' })
  data: Record<string, number | null>;

  // Provenance: Numbeo's own "Last update" date for this country (crowd-sourced data).
  @Column({
    name: 'source_last_update',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  sourceLastUpdate?: string;

  @Column({
    name: 'cached_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  cachedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;
}
