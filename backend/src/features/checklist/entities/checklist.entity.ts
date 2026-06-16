import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { Country } from '../../country/entities/country.entity';

@Entity({ name: 'checklist' })
export class Checklist {
  @PrimaryGeneratedColumn({ name: 'id_checklist' })
  idChecklist: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'steps', type: 'jsonb', nullable: true })
  steps?: unknown;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'country_id' })
  countryId: number;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'country_id' })
  country: Country;
}
