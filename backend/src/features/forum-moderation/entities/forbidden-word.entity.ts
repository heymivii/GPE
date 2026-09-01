import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserWarning } from './user-warning.entity';

export type ForbiddenWordSeverity = 'low' | 'medium' | 'high' | 'critical';

@Entity({ name: 'forbidden_word' })
export class ForbiddenWord {
  @PrimaryGeneratedColumn({ name: 'id_forbidden_word' })
  idForbiddenWord: number;

  @Column({ name: 'word', type: 'varchar', length: 255, unique: true })
  word: string;

  @Column({ name: 'severity', type: 'varchar', length: 20, default: 'medium' })
  severity: ForbiddenWordSeverity;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => UserWarning, (warning) => warning.forbiddenWord)
  warnings: UserWarning[];
}
