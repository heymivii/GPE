import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Country } from '../../country/entities/country.entity';

@Entity({ name: 'continent' })
export class Continent {
  @PrimaryGeneratedColumn({ name: 'continent_id' })
  continent_id: number;

  @Column({ name: 'name', type: 'varchar', length: 50 })
  name: string;

  @Column({ name: 'iso_code', type: 'char', length: 2, unique: true })
  iso_code: string;

  //cote inverse
  @OneToMany(() => Country, (c) => c.continent)
  countries?: Country[];
}
