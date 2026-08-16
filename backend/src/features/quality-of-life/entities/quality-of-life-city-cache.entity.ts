import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { City } from '../../city/entities/city.entity';

/**
 * CITY-level Numbeo Quality of Life indices (the sibling quality_of_life_cache is
 * COUNTRY-level). One row per city, 30-day TTL — DB-backed for anti-ban + provenance.
 */
@Entity({ name: 'quality_of_life_city_cache' })
export class QualityOfLifeCityCache {
  @PrimaryGeneratedColumn({ name: 'id_quality_of_life_city_cache' })
  idCache: number;

  @Column({ name: 'city_id', type: 'int', unique: true })
  cityId: number;

  @ManyToOne(() => City, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'city_id' })
  city: City;

  /** 'Numbeo' (scraped) or 'manuel' (admin-edited override). */
  @Column({ name: 'source', type: 'varchar', length: 20, default: 'Numbeo' })
  source: string;

  @Column({ name: 'data', type: 'jsonb' })
  data: Record<string, number | null>;

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
