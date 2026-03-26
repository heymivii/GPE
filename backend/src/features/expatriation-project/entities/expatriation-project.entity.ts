import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProcedureTracking } from '../../procedure-tracking/entities/procedure-tracking.entity';
import { TravelType } from 'src/features/project/travel-type/travel-type.entity';
import { User } from 'src/features/user/entities/user.entity';
import { Country } from 'src/features/country/entities/country.entity';
import { City } from 'src/features/city/entities/city.entity';

export interface ChecklistProgress {
  [stepId: string]: {
    completed: boolean;
    completedAt?: string;
    substeps?: {
      [substepId: string]: {
        completed: boolean;
        completedAt?: string;
      };
    };
  };
}

@Entity('expatriation_project')
export class ExpatriationProject {
  @PrimaryGeneratedColumn({ name: 'id_project' })
  idProject: number;

  @Column({ name: 'id_user' })
  idUser: number;

  @Column({ name: 'id_destination_country' })
  idDestinationCountry: number;

  @Column({ name: 'id_destination_city', nullable: true })
  idDestinationCity: number;

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
  housingBudget: number;

  @Column({ name: 'status', length: 50, default: 'planning' })
  projectStatus: string;


  @Column({ name: 'expected_departure_date', type: 'date', nullable: true })
  expectedDepartureDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(()=>User)
  @JoinColumn({name:'id_user' })
  user:User;

  // travel_type (string) → FK vers TravelType
  @ManyToOne(() => TravelType, { nullable: true })
  @JoinColumn({ name: 'id_travel_type'})
  travelType: TravelType;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'id_destination_country'})
  destinationCountry: Country;

  @ManyToOne(() => City)
  @JoinColumn({ name: 'id_destination_city'})
  destinationCity: City;
}
