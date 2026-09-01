import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

/**
 * F3 — Message privé entre deux utilisateurs. Pas de table `conversation` :
 * une conversation se déduit de la paire (sender, recipient).
 */
@Entity({ name: 'private_message' })
@Index('idx_private_message_pair', ['senderId', 'recipientId'])
@Index('idx_private_message_recipient_unread', ['recipientId', 'readAt'])
export class PrivateMessage {
  @PrimaryGeneratedColumn({ name: 'id_private_message' })
  idPrivateMessage: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'sender_id' })
  senderId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ name: 'recipient_id' })
  recipientId: number;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt?: Date | null;

  @Column({ name: 'is_moderated', type: 'boolean', default: false })
  isModerated: boolean;
}
