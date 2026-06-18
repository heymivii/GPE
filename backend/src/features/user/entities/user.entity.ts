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
  @PrimaryGeneratedColumn({ name: 'id_user' })
  idUser: number;

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

  // Profil renseigné à l'onboarding (étape "Profil").
  // status: student | employee | self_employed | unemployed | retired | other
  @Column({ name: 'status', type: 'varchar', length: 50, nullable: true })
  status?: string;

  // languageLevel: niveau CECRL dans la langue du pays cible (none | A1 | A2 | B1 | B2 | C1 | C2).
  @Column({ name: 'language_level', type: 'varchar', length: 10, nullable: true })
  languageLevel?: string;

  @Column({ name: 'mother_tongue', type: 'varchar', length: 100, nullable: true })
  motherTongue?: string;

  // Tableau natif Postgres (text[]) — évite le bug du simple-array où [] se relit en [''].
  @Column({ name: 'spoken_languages', type: 'text', array: true, nullable: true })
  spokenLanguages?: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @ManyToOne(() => Country, { nullable: true })
  @JoinColumn({ name: 'country_origin_id' })
  originCountry?: Country;

  @Column({ name: 'buddy_opt_in', type: 'boolean', default: true })
  buddyOptIn: boolean;

  @Column({ name: 'buddy_contact_opt_in', type: 'boolean', default: true })
  buddyContactOptIn: boolean;

  @OneToMany(() => ProcedureTracking, (tracking) => tracking.user)
  processTrackings: ProcedureTracking[];
}
// -- Buddy System opt-ins (ajoutés par feature/buddy-privacy) --
