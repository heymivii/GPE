import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export type UserReportStatus = 'pending' | 'resolved' | 'rejected';

@Entity({ name: 'user_report' })
export class UserReport {
  @PrimaryGeneratedColumn({ name: 'id_user_report' })
  idUserReport: number;

  @Column({ name: 'reason', type: 'varchar', length: 50 })
  reason: string;

  @Column({ name: 'details', type: 'text', nullable: true })
  details: string | null;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'pending' })
  status: UserReportStatus;

  @Column({ name: 'moderator_note', type: 'text', nullable: true })
  moderatorNote: string | null;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'reported_user_id' })
  reportedUser: User;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderator_id' })
  moderator: User | null;
}
