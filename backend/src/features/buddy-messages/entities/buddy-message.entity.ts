import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { BuddyContactRequest } from '../../buddy-contact/entities/buddy-contact-request.entity';

@Entity('buddy_message')
export class BuddyMessage {
  @PrimaryGeneratedColumn({ name: 'id_buddy_message' })
  id: number;

  @Column({ name: 'content', type: 'text' })
  content: string;

  @CreateDateColumn({ name: 'sent_at' })
  sentAt: Date;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'contact_request_id' })
  contactRequestId: number;

  @ManyToOne(() => BuddyContactRequest, { nullable: false })
  @JoinColumn({ name: 'contact_request_id' })
  contactRequest: BuddyContactRequest;

  @Column({ name: 'sender_id' })
  senderId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}
