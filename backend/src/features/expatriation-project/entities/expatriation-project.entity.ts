import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ProcedureTracking } from '../../procedure-tracking/entities/procedure-tracking.entity';

// Interface pour typer la progression de la checklist
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

  @Column({ name: 'travel_type', length: 50, nullable: true })
  travelType: string;

  @Column({ name: 'main_objective', length: 100, nullable: true })
  mainObjective: string;

  @Column({ name: 'expected_duration', nullable: true })
  expectedDuration: number;

  @Column({ name: 'housing_budget', type: 'decimal', precision: 10, scale: 2, nullable: true })
  housingBudget: number;

  @Column({ name: 'priorities', length: 100, nullable: true })
  priorities: string;

  @Column({ name: 'steps_done', type: 'text', nullable: true })
  stepsDone: string;

  @Column({ name: 'needs_support', default: false })
  needsSupport: boolean;

  @Column({ name: 'project_status', length: 50, default: 'planning' })
  projectStatus: string;

  @Column({ name: 'expected_departure_date', type: 'date', nullable: true })
  expectedDepartureDate: Date;

  @Column({
    name: 'checklist_progress',
    type: 'jsonb',
    default: '{}',
    nullable: true,
  })
  checklistProgress: ChecklistProgress;

  @Column({ name: 'language_level', length: 50, nullable: true })
  languageLevel: string;

  @Column({ name: 'id_origin_country', nullable: true })
  idOriginCountry: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => ProcedureTracking, (tracking) => tracking.project)
  processTrackings: ProcedureTracking[];
}
