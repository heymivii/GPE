import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ville } from '../../ville/entities/ville.entity';

@Entity({ name: 'cout_vie' })
export class CoutVie {
  @PrimaryGeneratedColumn({ name: 'id_cout' })
  id_cout: number;

  @Column({ name: 'logement_moyen', type: 'numeric', precision: 10, scale: 2, nullable: true })
  logement_moyen?: string;

  @Column({ name: 'transport_mensuel', type: 'numeric', precision: 10, scale: 2, nullable: true })
  transport_mensuel?: string;

  @Column({ name: 'alimentation', type: 'numeric', precision: 10, scale: 2, nullable: true })
  alimentation?: string;

  @Column({ name: 'services_public', type: 'numeric', precision: 10, scale: 2, nullable: true })
  services_public?: string;

  @Column({ name: 'date_maj', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date_maj: Date;

  @ManyToOne(() => Ville, { nullable: false })
  @JoinColumn({ name: 'id_ville', referencedColumnName: 'id_ville' })
  ville: Ville;
}

