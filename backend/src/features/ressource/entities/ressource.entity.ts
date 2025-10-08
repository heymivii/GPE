import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pays } from '../../pays/entities/pays.entity';

@Entity({ name: 'ressource' })
export class Ressource {
  @PrimaryGeneratedColumn({ name: 'id_ressource' })
  id_ressource: number;

  @Column({ name: 'titre', type: 'varchar', length: 255 })
  titre: string;

  @Column({ name: 'url', type: 'varchar', length: 500, nullable: true })
  url?: string;

  @Column({ name: 'type_ressource', type: 'varchar', length: 50, nullable: true })
  type_ressource?: string;

  @Column({ name: 'date_creation', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_creation: Date;

  @ManyToOne(() => Pays, { nullable: false })
  @JoinColumn({ name: 'id_pays', referencedColumnName: 'id_pays' })
  pays: Pays;
}

