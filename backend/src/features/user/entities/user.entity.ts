import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Pays } from '../../pays/entities/pays.entity';

@Entity({ name: 'utilisateur' }) 
export class Utilisateur {
  @PrimaryGeneratedColumn({ name: 'id_utilisateur' })
  id_utilisateur: number; 

  @Column({ name: 'nom', type: 'varchar', length: 100 })
  nom: string;

  @Column({ name: 'email', type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'mot_de_passe', type: 'varchar', length: 255 })
  mot_de_passe: string;

  @Column({
    name: 'role',
    type: 'varchar',
    length: 50,
    default: () => `'utilisateur'`,
  })
  role: string;

  @Column({
    name: 'date_creation',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  date_creation: Date;

  @ManyToOne(() => Pays, { nullable: true })
  @JoinColumn({ name: 'id_pays_origine', referencedColumnName: 'id_pays' })
  pays_origine?: Pays;

  @ManyToOne(() => Pays, { nullable: true })
  @JoinColumn({ name: 'id_pays_destination', referencedColumnName: 'id_pays' })
  pays_destination?: Pays;
}
