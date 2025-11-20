import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'notification' })
export class Notification {
  @PrimaryGeneratedColumn({ name: 'notification_id' })
  notification_id: number;

  @Column({ name: 'notif_type', type: 'varchar', length: 50 })
  notif_type: string;

  @Column({ name: 'message', type: 'text' })
  message: string;

  @Column({ name: 'is_read', type: 'boolean', default: false })
  is_read: boolean;

  @Column({ name: 'sent_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  sent_at: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'id_user' }) 
  user: User;
}
