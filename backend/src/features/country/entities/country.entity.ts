import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Continent } from '../../continent/entities/continent.entity';
import { City } from 'src/features/city/entities/city.entity';

@Entity('country')
export class Country {
  @PrimaryGeneratedColumn({ name: 'id_country' })
  idCountry: number;

  @Column({ name: 'country_name', type: 'varchar', length: 100 })
  countryName: string;

  @Column({
    name: 'iso_code',
    type: 'char',
    length: 2,
    unique: true,
    nullable: true,
  })
  isoCode?: string;


  @ManyToOne(() => Continent, { nullable: false })
  @JoinColumn({ name: 'continent_id' })
  continent: Continent;

  @OneToMany(() => City, (city) => city.country)
  cities: City[];
}
