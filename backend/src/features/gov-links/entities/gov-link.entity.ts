import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

// One canonical link per (country, category): the service upserts on this pair,
// so the DB enforces the same invariant the code relies on.
@Entity({ name: 'gov_link' })
@Unique('UQ_gov_link_country_cat', ['countryCode', 'category'])
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
