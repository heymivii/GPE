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
import { ProcedureTracking } from '../../procedure-tracking/entities/procedure-tracking.entity';

@Entity('app_user')
export class User {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'firstname', type: 'varchar', length: 50, nullable: true })
  firstName?: string;

  @Column({ name: 'lastname', type: 'varchar', length: 50, nullable: true })
  lastName?: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'roles', type: 'varchar', length: 50, default: 'user' })
  roles: string;

  @Column({ type: 'integer', nullable: true })
  age?: number;

  @Column({ name: 'country_origin_id', nullable: true })
  countryOriginId?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'country_origin_id' })
  originCountry?: Country;

  @OneToMany(() => ProcedureTracking, (tracking) => tracking.user)
  processTrackings: ProcedureTracking[];
}
