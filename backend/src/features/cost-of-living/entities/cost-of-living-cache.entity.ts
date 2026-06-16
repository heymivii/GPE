import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { City } from '../../city/entities/city.entity';

@Entity({ name: 'cost_of_living_cache' })
export class CostOfLivingCache {
  @PrimaryGeneratedColumn({ name: 'id_cost_of_living_cache' })
  idCache: number;

  @Column({ name: 'city_id' })
  cityId: number;

  @OneToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'city_id' })
  city: City;

  @Column({ name: 'data', type: 'jsonb' })
  data: Record<string, any>;

  @Column({
    name: 'cached_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  cachedAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;
}
