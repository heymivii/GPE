// src/features/guide/entities/guide.entity.ts
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from '../../country/entities/country.entity';

@Entity({ name: 'guide' })
export class Guide {
  @PrimaryGeneratedColumn({ name: 'guide_id' })
  guide_id: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({ name: 'guide_type', type: 'varchar', length: 50, nullable: true })
  guide_type?: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'country_id', referencedColumnName: 'country_id' })
  country: Country;
}
