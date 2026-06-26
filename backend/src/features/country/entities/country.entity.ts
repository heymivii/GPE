import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Continent } from '../../continent/entities/continent.entity';
import { City } from '../../city/entities/city.entity';
import { User } from '../../user/entities/user.entity';

/** Review workflow: added content stays 'pending_review' (invisible user-side) until another admin approves. */
export type ContentReviewStatus =
  | 'pending_review'
  | 'active'
  | 'archived'
  | 'rejected';

@Entity('country')
export class Country {
  @PrimaryGeneratedColumn({ name: 'id_country' })
  idCountry: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  countryName: string;

  @Column({
    name: 'iso_code',
    type: 'char',
    length: 2,
    unique: true,
    nullable: true,
  })
  isoCode?: string;
  @Column({ name: 'status', type: 'varchar', length: 20, default: 'active' })
  status: ContentReviewStatus;
  @Column({ name: 'continent_id' })
  continentId: number;

  @ManyToOne(() => Continent, { nullable: false })
  @JoinColumn({ name: 'continent_id' })
  continent: Continent;

  // ── Gov-links engine config (admin-managed, replaces the hardcoded registry) ──
  /** "The AI engine processes this country" switch. */
  @Column({ name: 'gov_link_enabled', type: 'boolean', default: false })
  govLinkEnabled: boolean;

  /** Anti-hallucination allowlist: official hostname suffixes (gouv.fr, admin.ch…). */
  @Column({ name: 'official_domains', type: 'jsonb', default: () => "'[]'" })
  officialDomains: string[];

  @OneToMany(() => City, (city) => city.country)
  cities: City[];

  // ── Review trace: who added it, who verified it ──────────────────────────
  @Column({ name: 'created_by_id', type: 'int', nullable: true })
  createdById?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User | null;

  @Column({ name: 'reviewed_by_id', type: 'int', nullable: true })
  reviewedById?: number | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy?: User | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date | null;
}
