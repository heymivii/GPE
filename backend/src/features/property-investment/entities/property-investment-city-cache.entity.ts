import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { City } from '../../city/entities/city.entity';

/**
 * CITY-level Numbeo property-investment indicators (price/m², price-to-income,
 * rental yields…). One row per city, 30-day TTL — DB-backed (the country-level
 * variant only uses an in-memory cache).
 */
@Entity({ name: 'property_investment_city_cache' })
export class PropertyInvestmentCityCache {
  @PrimaryGeneratedColumn({ name: 'id_property_investment_city_cache' })
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
