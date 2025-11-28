import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ExpatriationProject } from '../../expatriation-project/entities/expatriation-project.entity';
import { AdministrativeProcess } from '../../administrative-process/entities/administrative-process.entity';

@Entity('process_tracking')
export class ProcessTracking {
  @PrimaryGeneratedColumn({ name: 'id_tracking' })
  id_tracking: number;

  @Column({
    type: 'varchar',
    length: 50,
    default: 'not_started',
  })
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';

  @Column({ name: 'start_date', type: 'date', nullable: true })
  start_date: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  end_date: Date;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ name: 'id_user' })
  id_user: number;

  @Column({ name: 'id_process' })
  id_process: number;

  @Column({ name: 'id_project' })
  id_project: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.processTrackings, { nullable: false })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @ManyToOne(
    () => AdministrativeProcess,
    (process) => process.trackings,
    { nullable: false },
  )
  @JoinColumn({ name: 'id_process' })
  administrativeProcess: AdministrativeProcess;

  @ManyToOne(
    () => ExpatriationProject,
    (project) => project.processTrackings,
    { nullable: false },
  )
  @JoinColumn({ name: 'id_project' })
  project: ExpatriationProject;
}
