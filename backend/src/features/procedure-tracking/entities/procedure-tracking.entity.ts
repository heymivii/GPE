import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { AdminProcedure } from '../../admin-procedure/entities/admin-procedure.entity';

@Entity({ name: 'procedure_tracking' })
export class ProcedureTracking {
  @PrimaryGeneratedColumn({ name: 'tracking_id' })
  tracking_id: number;

  @Column({ name: 'status', type: 'varchar', length: 50, default: () => `'in_progress'` })
  status: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  start_date?: string;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  end_date?: string;

  @Column({ name: 'comment', type: 'text', nullable: true })
  comment?: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ManyToOne(() => AdminProcedure, { nullable: false })
  @JoinColumn({ name: 'admin_procedure_id', referencedColumnName: 'admin_procedure_id' })
  admin_procedure: AdminProcedure;
}

