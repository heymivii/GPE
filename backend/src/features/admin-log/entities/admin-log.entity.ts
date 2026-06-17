import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'admin_log' })
export class AdminLog {
  @PrimaryGeneratedColumn({ name: 'id_admin_log' })
  idAdminLog: number;

  @Column({ name: 'action', type: 'varchar', length: 50 })
  action: string; // CREATE, UPDATE, DELETE

  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  entityType: string; // Country, City, CostOfLiving, AdminProcedure, Resource, User

  @Column({ name: 'entity_id', type: 'varchar', length: 255 })
  entityId: string;

  @Column({ name: 'details', type: 'text', nullable: true })
  details?: string;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
