// country.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Continent } from '../../continent/entities/continent.entity';

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  isoCode: string;

  @Column({ nullable: true })
  currency: string;

  @Column('simple-json', { nullable: true })
  languages: Record<string, string>;

  @Column({ nullable: true })
  flag: string;

  @Column({ nullable: true })
  mapsUrl: string;

  @Column({ nullable: true })
  visaInfoUrl: string;

  @Column({ nullable: true })
  capital: string;

  @Column({ nullable: true })
  subregion: string;

  @Column('float', { nullable: true })
  latitude: number;

  @Column('float', { nullable: true })
  longitude: number;

  @Column('float', { nullable: true })
  area: number;

  @Column('bigint', { nullable: true })
  population: number;

  @ManyToOne(() => Continent, continent => continent.id)
  continent: Continent;
}
