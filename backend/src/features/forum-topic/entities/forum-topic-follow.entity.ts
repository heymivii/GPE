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
import { ForumTopic } from './forum-topic.entity';

/**
 * Suivi d'un topic par un utilisateur (« Join »). Un utilisateur ne suit un topic
 * qu'une seule fois → contrainte d'unicité sur (user_id, topic_id).
 */
@Entity({ name: 'forum_topic_follow' })
@Index('uq_forum_topic_follow_user_topic', ['user', 'topic'], { unique: true })
export class ForumTopicFollow {
  @PrimaryGeneratedColumn({ name: 'id_forum_topic_follow' })
  idForumTopicFollow: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => ForumTopic, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic: ForumTopic;

  @Column({ name: 'topic_id' })
  topicId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
