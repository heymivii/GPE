import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { TravelType } from 'src/features/project/travel-type/travel-type.entity';
import { User } from 'src/features/user/entities/user.entity';
import { Country } from 'src/features/country/entities/country.entity';
import { City } from 'src/features/city/entities/city.entity';

@Entity('expatriation_project')
export class ExpatriationProject {
  @PrimaryGeneratedColumn({ name: 'id_project' })
  idProject: number;

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

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => TravelType, { nullable: true })
  @JoinColumn({ name: 'travel_type_id' })
  travelType: TravelType;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'destination_country_id' })
  destinationCountry: Country;

  @ManyToOne(() => City, { nullable: true })
  @JoinColumn({ name: 'destination_city_id' })
  destinationCity: City;
}
