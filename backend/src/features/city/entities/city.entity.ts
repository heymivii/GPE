import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Country } from '../../country/entities/country.entity';

@Entity({ name: 'city' })
export class City {
  @PrimaryGeneratedColumn({ name: 'city_id' })
  city_id: number; 

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string; 

  @Column({ name: 'latitude', type: 'numeric', precision: 10, scale: 8, nullable: true })
  latitude?: string;

  @Column({ name: 'longitude', type: 'numeric', precision: 11, scale: 8, nullable: true })
  longitude?: string;

  @Column({ name: 'population', type: 'integer', nullable: true })
  population?: number;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'country_id'})
  country: Country; // FK -> country(country_id)
}

