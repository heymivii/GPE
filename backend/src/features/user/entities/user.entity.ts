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

@Entity('app_user')
export class User {
  @PrimaryGeneratedColumn({ name: 'id_user' })
  idUser: number;

  @Column({ name: 'full_name', type: 'varchar', length: 100 })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ name: 'user_role', type: 'varchar', length: 50, default: 'user' })
  userRole: string;

  @Column({ type: 'integer', nullable: true })
  age?: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status?: string;

  @Column({ name: 'language_level', type: 'varchar', length: 50, nullable: true })
  languageLevel?: string;

  @Column({ name: 'id_origin_country', nullable: true })
  idOriginCountry?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'id_origin_country' })
  originCountry?: Country;
}
