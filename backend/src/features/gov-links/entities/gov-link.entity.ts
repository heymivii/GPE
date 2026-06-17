import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'gov_link' })
export class GovLink {
  @PrimaryGeneratedColumn({ name: 'id_gov_link' })
  id: number;

  @Column({ name: 'country_code', type: 'varchar', length: 2 })
  countryCode: string;

  @Column({ name: 'category', type: 'varchar', length: 50 })
  category: string;

  @Column({ name: 'label', type: 'varchar', length: 255 })
  label: string;

  @Column({ name: 'url', type: 'text' })
  url: string;

  @Column({ name: 'source_query', type: 'text', nullable: true })
  sourceQuery?: string;

  @Column({ name: 'confidence', type: 'float', default: 0 })
  confidence: number;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'active' })
  status: string;
}
