import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Country } from '../../country/entities/country.entity';

@Entity()
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  countryCode: string;

  @Column({ nullable: true })
  region: string;

  @Column('decimal', { nullable: true })
  latitude: number;

  @Column('decimal', { nullable: true })
  longitude: number;

  @Column({ nullable: true })
  population: number;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'countryId' })
  country: Country;

  @Column({ nullable: true })
  countryId: number;
}
