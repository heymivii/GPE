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
import { ForumMessage } from '../../forum-message/entities/forum-message.entity';

/**
 * F4 — Notation de l'aide reçue. Un utilisateur (rater) note le message d'un autre
 * (ratedUser) de 1 à 5 étoiles. Unicité (rater, message) : on ne note qu'une fois le
 * même message (re-noter met à jour la note existante).
 */
@Entity({ name: 'support_rating' })
@Index('uq_support_rating_rater_message', ['raterId', 'messageId'], {
  unique: true,
})
export class SupportRating {
  @PrimaryGeneratedColumn({ name: 'id_support_rating' })
  idSupportRating: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rater_id' })
  rater: User;

  @Column({ name: 'rater_id' })
  raterId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'rated_user_id' })
  ratedUser: User;

  @Column({ name: 'rated_user_id' })
  ratedUserId: number;

  @ManyToOne(() => ForumMessage, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'message_id' })
  message?: ForumMessage | null;

  @Column({ name: 'message_id', type: 'int', nullable: true })
  messageId?: number | null;

  @Column({ name: 'stars', type: 'smallint' })
  stars: number;

  @Column({ name: 'comment', type: 'text', nullable: true })
  comment?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
