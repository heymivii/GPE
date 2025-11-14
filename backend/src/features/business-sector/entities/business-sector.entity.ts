import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('business_sector')
export class BusinessSector {
  @PrimaryGeneratedColumn({ name: 'id_sector' })
  idSector: number;

  @Column({ name: 'sector_name', type: 'varchar', length: 100, unique: true })
  sectorName: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations (optionnel)
  // @OneToMany(() => JobOffer, (jobOffer) => jobOffer.sector)
  // jobOffers: JobOffer[];
}