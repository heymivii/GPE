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

// ✅ Typage fort de la progression checklist
export interface ChecklistSubstepProgress {
  completed: boolean;
  completedAt?: string; // ISO date string
}

export interface ChecklistStepProgress {
  completed: boolean;
  completedAt?: string;
  substeps?: Record<string, ChecklistSubstepProgress>;
}

export type ChecklistProgress = Record<string, ChecklistStepProgress>;

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

  // ✅ Typage fort remplacé (était Record<string, unknown> | null)
  @Column({ name: 'checklist_progress', type: 'jsonb', nullable: true })
  checklistProgress: ChecklistProgress | null;

  @Column({ name: 'priorities', type: 'varchar', length: 100, nullable: true })
  priorities: string | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @Column({ name: 'completed_reason', type: 'text', nullable: true })
  completedReason: string | null;

  @Column({ name: 'completed_feedback', type: 'text', nullable: true })
  completedFeedback: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancellation_reason', type: 'varchar', length: 100, nullable: true })
  cancellationReason: string | null;

  @Column({ name: 'cancellation_details', type: 'text', nullable: true })
  cancellationDetails: string | null;
}