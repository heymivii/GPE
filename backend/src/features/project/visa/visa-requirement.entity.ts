import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from '../../country/entities/country.entity';

@Entity('visa_requirement')
export class VisaRequirement {
  @PrimaryGeneratedColumn({ name: 'id_visa_requirement' })
  idVisaRequirement: number;

  @Column({ name: 'origin_country_id' })
  originCountryId: number;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'origin_country_id' })
  originCountry: Country;

  @Column({ name: 'destination_country_id' })
  destinationCountryId: number;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'destination_country_id' })
  destinationCountry: Country;

  @Column({ name: 'visa_type', type: 'varchar', length: 100 })
  visaType: string;

  @Column({ name: 'duration_days', type: 'int', nullable: true })
  durationDays: number;

  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;
}
