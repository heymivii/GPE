import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn({ name: 'id_notification' })
  idNotification: number;

  @Column({ name: 'notif_type', type: 'varchar', length: 50 })
  notifType: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  /**
   * Contexte cliquable (facultatif) : le front mappe (contextType, contextId)
   * vers une route — ex. 'project' + idProject → /projects/:id/checklist.
   */
  @Column({ name: 'context_type', type: 'varchar', length: 40, nullable: true })
  contextType: string | null;

  @Column({ name: 'context_id', type: 'int', nullable: true })
  contextId: number | null;

  /** Libellé facultatif associé au contexte — ex. le prénom pour un contexte 'user'. */
  @Column({ name: 'context_label', type: 'varchar', length: 120, nullable: true })
  contextLabel: string | null;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
