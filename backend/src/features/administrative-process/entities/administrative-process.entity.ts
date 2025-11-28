import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Country } from '../../country/entities/country.entity';

@Entity('administrative_process')
export class AdministrativeProcess {
  @PrimaryGeneratedColumn({ name: 'id_process' })
  id_process: number;

  @Column({ name: 'process_type', type: 'varchar', length: 100 })
  process_type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'required_documents', type: 'text', nullable: true })
  required_documents: string;

  @Column({ name: 'average_duration', type: 'integer', nullable: true })
  average_duration: number;

  @Column({ name: 'id_country' })
  id_country: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => Country, (country) => country.administrativeProcesses, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_country' })
  country: Country;

  @OneToMany(
    'ProcessTracking',
    'administrativeProcess',
  )
  trackings: any[];
}
