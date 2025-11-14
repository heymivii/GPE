import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { City } from '../../city/entities/city.entity';

@Entity({ name: 'cost_of_living' })
export class CostOfLiving {
  @PrimaryGeneratedColumn({ name: 'cost_id' })
  cost_id: number;

  @Column({ name: 'avg_housing', type: 'numeric', precision: 10, scale: 2, nullable: true })
  avg_housing?: string;

  @Column({ name: 'monthly_transport', type: 'numeric', precision: 10, scale: 2, nullable: true })
  monthly_transport?: string;

  @Column({ name: 'food', type: 'numeric', precision: 10, scale: 2, nullable: true })
  food?: string;

  @Column({ name: 'public_services', type: 'numeric', precision: 10, scale: 2, nullable: true })
  public_services?: string;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'city_id'})
  city: City;
}

