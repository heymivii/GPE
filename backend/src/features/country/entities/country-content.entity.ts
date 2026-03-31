import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from './country.entity';

@Entity('country_content')
export class CountryContent {
  @PrimaryGeneratedColumn({ name: 'id_country_content' })
  id_country_content: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ name: 'content_type' })
  content_type: string;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'country_id' })
  country: Country;
}
