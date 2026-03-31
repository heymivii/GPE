import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ForumMessage } from './forum-message.entity';
import { ForumTopic } from '../../forum-topic/entities/forum-topic.entity';

export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'inappropriate'
  | 'misinformation'
  | 'other';

export type ReportStatus = 'pending' | 'resolved' | 'rejected';

@Entity({ name: 'forum_report' })
export class ForumReport {
  @PrimaryGeneratedColumn({ name: 'id_report' })
  idReport: number;

  @Column({ name: 'reason', type: 'varchar', length: 50 })
  reason: ReportReason;

  @Column({ name: 'details', type: 'text', nullable: true })
  details?: string;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'pending' })
  status: ReportStatus;

  @Column({ name: 'moderator_note', type: 'text', nullable: true })
  moderatorNote?: string;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;

  @ManyToOne(() => ForumMessage, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'message_id' })
  message?: ForumMessage;

  @ManyToOne(() => ForumTopic, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'topic_id' })
  topic?: ForumTopic;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'moderator_id' })
  moderator?: User;
}
