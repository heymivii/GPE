import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { User } from '../../user/entities/user.entity';
import { ExpatriationProject } from '../../expatriation-project/entities/expatriation-project.entity';
import { ProcedureTracking } from '../../procedure-tracking/entities/procedure-tracking.entity';

/**
 * Fichier personnel d'un utilisateur (passeport, visa, contrat…), rattaché à un projet
 * et optionnellement à une étape de la checklist. Le fichier lui-même est chiffré sur
 * disque hors web-root ; la BDD ne stocke que des métadonnées + une clé aléatoire.
 */
@Entity('user_document')
export class UserDocument {
  @PrimaryGeneratedColumn({ name: 'id_document' })
  idDocument: number;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName: string;

  /** Type prédéfini (passport, id_card, visa, …) — libellé traduit côté front. */
  @Column({ name: 'doc_type', type: 'varchar', length: 40, default: 'other' })
  docType: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'int' })
  sizeBytes: number;

  /** Nom aléatoire (UUID) du fichier chiffré sur disque — jamais exposé au client. */
  @Exclude()
  @Column({ name: 'storage_key', type: 'varchar', length: 100 })
  storageKey: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ExpatriationProject, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ExpatriationProject | null;

  @ManyToOne(() => ProcedureTracking, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'procedure_tracking_id' })
  procedureTracking: ProcedureTracking | null;
}
