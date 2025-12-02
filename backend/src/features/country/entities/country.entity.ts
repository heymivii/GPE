import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Continent } from '../../continent/entities/continent.entity';
import { AdminProcedure } from '../../admin-procedure/entities/admin-procedure.entity';

@Entity('country')
export class Country {
  @PrimaryGeneratedColumn({ name: 'id_country' })
  idCountry: number;

  @Column({ name: 'country_name', type: 'varchar', length: 100 })
  countryName: string;

  @Column({ name: 'iso_code', type: 'char', length: 2, unique: true, nullable: true })
  isoCode?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  currency?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  language?: string;

  @Column({ name: 'visa_info', type: 'text', nullable: true })
  visaInfo?: string;

  @Column({ name: 'flag_url', type: 'varchar', length: 255, nullable: true })
  flagUrl?: string;

  @Column({ name: 'id_continent' })
  idContinent: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Continent, { nullable: false })
  @JoinColumn({ name: 'id_continent' })
  continent: Continent;

  @OneToMany(() => AdminProcedure, (process) => process.country)
  administrativeProcedures: AdminProcedure[];
}
