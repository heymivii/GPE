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
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

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

  @ManyToOne(() => ForumTopic, { nullable: false })
  @JoinColumn({ name: 'topic_id' })
  topic: ForumTopic;


  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
