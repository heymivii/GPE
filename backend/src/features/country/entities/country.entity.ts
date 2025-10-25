import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Continent } from '../../continent/entities/continent.entity';

@Entity({ name: 'country' })
export class Country {
  @PrimaryGeneratedColumn({ name: 'country_id' })
  country_id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'iso_code', type: 'char', length: 2, unique: true })
  iso_code: string;

  @Column({ name: 'currency', type: 'varchar', length: 50, nullable: true })
  currency?: string;

  @Column({ name: 'language', type: 'text', nullable: true })
  language?: string;

  @Column({ name: 'visa_info', type: 'text', nullable: true })
  visa_info?: string;

  @Column({ name: 'flag', type: 'varchar', length: 255, nullable: true })
  flag?: string;

  @ManyToOne(() => Continent, { nullable: false })
  @JoinColumn({ name: 'continent_id', referencedColumnName: 'continent_id' })
  continent: Continent;
}
