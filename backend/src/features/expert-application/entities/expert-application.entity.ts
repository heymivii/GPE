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
import { Country } from '../../country/entities/country.entity';

export type ExpertApplicationStatus = 'pending' | 'approved' | 'rejected';

/**
 * Candidature d'un utilisateur au statut d'expert vérifié.
 *
 * Les experts affichés sur /experts étaient jusqu'ici promus à la main en base :
 * aucun parcours ne permettait de postuler, et rien n'expliquait d'où ils venaient
 * (retour de recette). Cette entité porte la demande et sa pièce justificative.
 *
 * Le diplôme est chiffré au repos via DocumentStorageService, comme les documents
 * personnels : la BDD ne garde que des métadonnées et une clé aléatoire.
 */
@Entity('expert_application')
export class ExpertApplication {
  @PrimaryGeneratedColumn({ name: 'id_expert_application' })
  idExpertApplication: number;

  /** Intitulé revendiqué : « Avocat en droit de l'immigration », etc. */
  @Column({ name: 'expert_title', type: 'varchar', length: 120 })
  expertTitle: string;

  /** Parcours et motivation, affichés tels quels au modérateur. */
  @Column({ name: 'motivation', type: 'text' })
  motivation: string;

  @Column({ name: 'status', type: 'varchar', length: 20, default: 'pending' })
  status: ExpertApplicationStatus;

  // ── Pièce justificative (diplôme, attestation d'inscription à l'ordre…) ──

  @Column({ name: 'diploma_original_name', type: 'varchar', length: 255 })
  diplomaOriginalName: string;

  @Column({ name: 'diploma_mime_type', type: 'varchar', length: 100 })
  diplomaMimeType: string;

  @Column({ name: 'diploma_size_bytes', type: 'int' })
  diplomaSizeBytes: number;

  /** Nom aléatoire (UUID) du fichier chiffré sur disque — jamais exposé au client. */
  @Exclude()
  @Column({ name: 'diploma_storage_key', type: 'varchar', length: 100 })
  diplomaStorageKey: string;

  // ── Décision ────────────────────────────────────────────────────────────

  /** Motif communiqué au candidat en cas de refus. */
  @Column({ name: 'review_note', type: 'text', nullable: true })
  reviewNote?: string | null;

  @Column({ name: 'reviewed_by', type: 'int', nullable: true })
  reviewedBy?: number | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'country_id', type: 'int', nullable: true })
  countryId?: number | null;

  /** Pays sur lequel le candidat déclare son expertise. */
  @ManyToOne(() => Country, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'country_id' })
  country?: Country | null;
}
