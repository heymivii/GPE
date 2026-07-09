import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AdminProcedure } from '../../admin-procedure/entities/admin-procedure.entity';
import { ExpatriationProject } from '../../expatriation-project/entities/expatriation-project.entity';

@Entity({ name: 'procedure_tracking' })
export class ProcedureTracking {
  @PrimaryGeneratedColumn({ name: 'id_procedure_tracking' })
  idProcedureTracking: number;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: () => `'in_progress'`,
  })
  status: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  start_date?: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  end_date?: string;

  @Column({ name: 'comments', type: 'text', nullable: true })
  comments: string | null;

  /** completed action texts (content-keyed; survives regeneration — only reworded actions reset) */
  @Column({ name: 'completed_facts', type: 'jsonb', default: () => "'[]'" })
  completedFacts: string[];

  /** Dernier palier de rappel d'échéance envoyé (30 puis 7) — évite les doublons. */
  @Column({ name: 'last_reminder_days', type: 'int', nullable: true })
  lastReminderDays: number | null;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => AdminProcedure, { nullable: false })
  @JoinColumn({ name: 'admin_procedure_id' })
  admin_procedure: AdminProcedure;

  @ManyToOne(() => ExpatriationProject, { nullable: false })
  @JoinColumn({ name: 'project_id' })
  project: ExpatriationProject;
}
