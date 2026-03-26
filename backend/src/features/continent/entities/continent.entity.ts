import { Country } from 'src/features/country/entities/country.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('continent')
export class Continent {
  @PrimaryGeneratedColumn({ name: 'id_continent' })
  idContinent: number;

  @Column({
    name: 'continent_name',
    type: 'varchar',
    length: 100,
    unique: true,
  })
  continentName: string;

  @Column({
    name: 'iso_code',
    type: 'char',
    length: 2,
    unique: true,
    nullable: true,
  })
  isoCode?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() =>Country, (country)=> country.continent)
  countries:Country[];
}
