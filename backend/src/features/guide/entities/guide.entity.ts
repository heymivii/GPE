// src/features/guide/entities/guide.entity.ts
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pays } from '../../pays/entities/pays.entity';

@Entity({ name: 'guide' })
export class Guide {
  @PrimaryGeneratedColumn({ name: 'id_guide' })
  id_guide: number;

  @Column({ name: 'titre', type: 'varchar', length: 255 })
  titre: string;

  @Column({ name: 'contenu', type: 'text' })
  contenu: string;

  @Column({ name: 'type_guide', type: 'varchar', length: 50, nullable: true })
  type_guide?: string;

  @Column({ name: 'date_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_creation: Date;

  @ManyToOne(() => Pays, { nullable: false })
  @JoinColumn({ name: 'id_pays', referencedColumnName: 'id_pays' })
  pays: Pays;
}
