// src/features/job-offer/entities/job-offer.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { City } from '../../city/entities/city.entity';
import { IndustrySector } from '../../industry-sector/entities/industry-sector.entity';

@Entity({ name: 'job_offer' })
export class JobOffer {
  @PrimaryGeneratedColumn({ name: 'job_offer_id' })
  job_offer_id: number;

  @Column({ name: 'job_title', type: 'varchar', length: 255 })
  job_title: string;

  @Column({ name: 'company', type: 'varchar', length: 255, nullable: true })
  company?: string;

  @Column({ name: 'avg_salary', type: 'numeric', precision: 10, scale: 2, nullable: true })
  avg_salary?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'publication_date', type: 'date', default: () => 'CURRENT_DATE' })
  publication_date: string;

  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'city_id', referencedColumnName: 'city_id' })
  city: City;

  @ManyToOne(() => IndustrySector, { nullable: false })
  @JoinColumn({ name: 'sector_id', referencedColumnName: 'sector_id' })
  sector: IndustrySector;
}

