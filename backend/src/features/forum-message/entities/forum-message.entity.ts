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
  @PrimaryGeneratedColumn({ name: 'message_id' })
  message_id: number;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @Column({
    name: 'sent_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  sent_at: Date;

  @ManyToOne(() => ForumTopic, { nullable: false })
  @JoinColumn({ name: 'topic_id', referencedColumnName: 'topic_id' })
  topic: ForumTopic;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;
}
