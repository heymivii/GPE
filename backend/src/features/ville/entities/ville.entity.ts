import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Pays } from '../../pays/entities/pays.entity';

@Entity({ name: 'ville' })
export class Ville {
  @PrimaryGeneratedColumn({ name: 'id_ville' })
  id_ville: number;

  @Column({ name: 'nom_ville', type: 'varchar', length: 100 })
  nom_ville: string;

  // DECIMAL(10,8) et DECIMAL(11,8) → Postgres = numeric(precision, scale)
  @Column({ name: 'latitude', type: 'numeric', precision: 10, scale: 8, nullable: true })
  latitude?: string;

  @Column({ name: 'longitude', type: 'numeric', precision: 11, scale: 8, nullable: true })
  longitude?: string;

  @Column({ name: 'population', type: 'integer', nullable: true })
  population?: number;

  @ManyToOne(() => Pays, { nullable: false })
  @JoinColumn({ name: 'id_pays', referencedColumnName: 'id_pays' })
  pays: Pays;
}

