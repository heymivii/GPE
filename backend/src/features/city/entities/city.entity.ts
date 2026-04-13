import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from '../../country/entities/country.entity';

@Entity({ name: 'city' })
export class City {
  @PrimaryGeneratedColumn({ name: 'id_city' })
  idCity: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({
    name: 'latitude',
    type: 'numeric',
    precision: 10,
    scale: 8,
    nullable: true,
  })
  latitude?: string;

  @Column({
    name: 'longitude',
    type: 'numeric',
    precision: 11,
    scale: 8,
    nullable: true,
  })
  longitude?: string;

  @Column({ name: 'population', type: 'integer', nullable: true })
  population?: number;

  @Column({ name: 'timezone', type: 'varchar', length: 100, nullable: true })
  timezone: string;

  @Column({ name: 'is_capital', type: 'boolean', default: false })
  isCapital: boolean;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string;

  @Column({ name: 'country_id' })
  countryId: number;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'country_id' })
  country: Country;
}
