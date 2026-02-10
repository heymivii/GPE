import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { City } from '../../city/entities/city.entity';

@Entity({ name: 'cost_of_living' })
export class CostOfLiving {
  @PrimaryGeneratedColumn({ name: 'id_cost' })
  id_cost: number;

  @Column({ name: 'average_rent', type: 'numeric', precision: 10, scale: 2, nullable: true })
  average_rent?: string;

  @Column({ name: 'monthly_transport', type: 'numeric', precision: 10, scale: 2, nullable: true })
  monthly_transport?: string;

  @Column({ name: 'food_expenses', type: 'numeric', precision: 10, scale: 2, nullable: true })
  food_expenses?: string;

  @Column({ name: 'public_services', type: 'numeric', precision: 10, scale: 2, nullable: true })
  public_services?: string;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'id_city' })
  city: City;
}

