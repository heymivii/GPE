import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TravelType } from '../../project/travel-type/travel-type.entity';
import { User } from '../../user/entities/user.entity';
import { Country } from '../../country/entities/country.entity';
import { City } from '../../city/entities/city.entity';

@Entity('expatriation_project')
export class ExpatriationProject {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'objective', length: 100, nullable: true })
  objective: string;

  @Column({ name: 'expected_duration', nullable: true })
  expectedDuration: number;

  @Column({
    name: 'budget',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  budget: number;

  @Column({ name: 'status', length: 50, default: 'planning' })
  status: string;

  @Column({ name: 'expected_departure_date', type: 'date', nullable: true })
  expectedDepartureDate: Date;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'travel_type_id', nullable: true })
  travelTypeId: number;

  @ManyToOne(() => TravelType, { nullable: true })
  @JoinColumn({ name: 'travel_type_id' })
  travelType: TravelType;

  @Column({ name: 'destination_country_id' })
  destinationCountryId: number;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'destination_country_id' })
  destinationCountry: Country;

  @Column({ name: 'destination_city_id', nullable: true })
  destinationCityId: number;

  @ManyToOne(() => City, { nullable: true })
  @JoinColumn({ name: 'destination_city_id' })
  destinationCity: City;
}
