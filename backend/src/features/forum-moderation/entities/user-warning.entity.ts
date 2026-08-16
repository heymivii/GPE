import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { ForumMessage } from '../../forum-message/entities/forum-message.entity';
import { ForbiddenWord } from './forbidden-word.entity';

@Entity({ name: 'user_warning' })
export class UserWarning {
  @PrimaryGeneratedColumn({ name: 'id_user_warning' })
  idUserWarning: number;

  @Column({ name: 'reason', type: 'text' })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ForumMessage, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'message_id' })
  message: ForumMessage | null;

  @ManyToOne(() => ForbiddenWord, (fw) => fw.warnings, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'forbidden_word_id' })
  forbiddenWord: ForbiddenWord | null;
}
