import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from '../../country/entities/country.entity';

@Entity({ name: 'admin_procedure' })
export class AdminProcedure {
  @PrimaryGeneratedColumn({ name: 'admin_procedure_id' })
  admin_procedure_id: number;

  @Column({ name: 'procedure_type', type: 'varchar', length: 100 })
  procedure_type: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'category', type: 'varchar', nullable: true })
  category?: string;

  @Column({ name: 'step_order', type: 'integer', nullable: true })
  step_order?: string;

  @Column({ name: 'average_delay_days', type: 'integer', nullable: true })
  average_delay_days?: number;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'country_id' })
  country: Country;
}
