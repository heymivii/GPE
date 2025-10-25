import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from '../../country/entities/country.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  user_id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  password_hash: string;

  @Column({
    name: 'role',
    type: 'varchar',
    length: 50,
    default: () => `'user'`,
  })
  role: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'origin_country_id', referencedColumnName: 'country_id' })
  origin_country?: Country;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({
    name: 'destination_country_id',
    referencedColumnName: 'country_id',
  })
  destination_country?: Country;
}
