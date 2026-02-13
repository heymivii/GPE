import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Country } from '../../country/entities/country.entity';
import { ForumMessage } from '../../forum-message/entities/forum-message.entity';

@Entity({ name: 'forum_topic' })
export class ForumTopic {
  @PrimaryGeneratedColumn({ name: 'id_topic' })
  topic_id: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'category', type: 'varchar', length: 50, nullable: true })
  category?: string;

  @Column({ name: 'views_count', type: 'int', default: 0 })
  views_count: number;

  @Column({ name: 'is_pinned', type: 'boolean', default: false })
  is_pinned: boolean;

  @Column({ name: 'is_locked', type: 'boolean', default: false })
  is_locked: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'id_country' })
  country?: Country;

  @OneToMany(() => ForumMessage, (message) => message.topic)
  messages: ForumMessage[];
}
