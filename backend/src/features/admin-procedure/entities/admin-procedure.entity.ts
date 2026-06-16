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
  @PrimaryGeneratedColumn({ name: 'id_admin_procedure' })
  idAdminProcedure: number;

  @Column({ name: 'procedure_type', type: 'varchar', length: 100 })
  procedureType: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'category', type: 'varchar', nullable: true })
  category?: string;

  @Column({ name: 'step_order', type: 'integer', nullable: true })
  stepOrder?: number;

  @Column({ name: 'average_delay_days', type: 'integer', nullable: true })
  averageDelayDays?: number;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'country_id' })
  country: Country;
}
