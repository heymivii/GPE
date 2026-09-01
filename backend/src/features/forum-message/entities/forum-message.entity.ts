import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ForumTopic } from '../../forum-topic/entities/forum-topic.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'forum_message' })
export class ForumMessage {
  @PrimaryGeneratedColumn({ name: 'id_forum_message' })
  idForumMessage: number;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  sentAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  // ── Modération (schéma d'Arphan, add-fields-row-db) ──
  @Column({ name: 'is_moderated', type: 'boolean', default: false })
  isModerated: boolean;

  @Column({ name: 'moderation_reason', type: 'text', nullable: true })
  moderationReason: string | null;

  @Column({ name: 'moderated_at', type: 'timestamp', nullable: true })
  moderatedAt: Date | null;

  @ManyToOne(() => ForumTopic, { nullable: false })
  @JoinColumn({ name: 'topic_id' })
  topic: ForumTopic;


  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
