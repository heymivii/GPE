import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

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

  @Column({ name: 'needs_support', default: false })
  needsSupport: boolean;

  @Column({ name: 'project_status', length: 50, default: 'planning' })
  projectStatus: string;

  @Column({ name: 'expected_departure_date', type: 'date', nullable: true })
  expectedDepartureDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
