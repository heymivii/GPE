import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pays } from '../../pays/entities/pays.entity';

@Entity({ name: 'checklist' })
export class Checklist {
  @PrimaryGeneratedColumn({ name: 'id_checklist' })
  id_checklist: number;

  @Column({ name: 'titre', type: 'varchar', length: 255 })
  titre: string;

  // JSONB (peut être un objet, un tableau, etc.)
  @Column({ name: 'etapes', type: 'jsonb', nullable: true })
  etapes?: unknown; 

  @Column({ name: 'date_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_creation: Date;

  @ManyToOne(() => Pays, { nullable: false })
  @JoinColumn({ name: 'id_pays', referencedColumnName: 'id_pays' })
  pays: Pays;
}

