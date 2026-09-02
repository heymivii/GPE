import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AdminProcedure } from '../../admin-procedure/entities/admin-procedure.entity';

export type BuddyContactStatus = 'pending' | 'accepted' | 'declined' | 'expired';

@Entity('buddy_contact_request')
export class BuddyContactRequest {
  @PrimaryGeneratedColumn({ name: 'id_buddy_contact_request' })
  id: number;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'pending' })
  status: BuddyContactStatus;

  @Column({ name: 'message', type: 'text', nullable: true })
  message: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date;

  @Column({ name: 'sender_id' })
  senderId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ name: 'recipient_id' })
  recipientId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  @Column({ name: 'procedure_id' })
  procedureId: number;

  @ManyToOne(() => AdminProcedure, { nullable: false })
  @JoinColumn({ name: 'procedure_id' })
  procedure: AdminProcedure;
}
