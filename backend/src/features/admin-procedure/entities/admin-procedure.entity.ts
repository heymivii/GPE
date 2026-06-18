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

  // ✅ Ajout pour les deadlines checklist
  @Column({ name: 'days_before_departure', type: 'integer', nullable: true })
  daysBeforeDeparture?: number;

  // Gov-link enrichment fields
  @Column({ name: 'source_url', type: 'text', nullable: true })
  sourceUrl?: string;

  @Column({ name: 'objectives', type: 'jsonb', nullable: true })
  objectives?: string[];

  @Column({ name: 'key_facts', type: 'jsonb', nullable: true })
  keyFacts?: string[];

  // Concrete actionable tasks copied from the gov_link (what the expat must DO).
  @Column({ name: 'action_items', type: 'jsonb', nullable: true })
  actionItems?: string[];

  /** When this step must be done: 'before' departure or 'on_arrival'. */
  @Column({ name: 'phase', type: 'varchar', length: 20, nullable: true })
  phase?: string;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'country_id' })
  country: Country;
}