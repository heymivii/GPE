// src/features/job-offer/entities/job-offer.entity.ts
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { City } from '../../city/entities/city.entity';
import { BusinessSector } from '../../business-sector/entities/business-sector.entity';

@Entity({ name: 'job_offer' })
export class JobOffer {
  @PrimaryGeneratedColumn({ name: 'id_offer' })
  idOffer: number;

  @Column({ name: 'job_title', type: 'varchar', length: 255 })
  jobTitle: string;

  @Column({ name: 'company_name', type: 'varchar', length: 255, nullable: true })
  companyName?: string;

  @Column({ name: 'average_salary', type: 'decimal', precision: 10, scale: 2, nullable: true })
  averageSalary?: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'publication_date', type: 'date', default: () => 'CURRENT_DATE' })
  publicationDate: Date;

  @Column({ name: 'id_city' })
  idCity: number;

  @Column({ name: 'id_sector', nullable: true })
  idSector?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'id_city' })
  city: City;

  @ManyToOne(() => BusinessSector, { nullable: true })
  @JoinColumn({ name: 'id_sector' })
  sector?: BusinessSector;
}