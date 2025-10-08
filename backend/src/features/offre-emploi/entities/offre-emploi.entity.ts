import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Ville } from '../../ville/entities/ville.entity';
import { SecteurActivite } from '../../secteur-activite/entities/secteur-activite.entity';

@Entity({ name: 'offre_emploi' })
export class OffreEmploi {
  @PrimaryGeneratedColumn({ name: 'id_offre' })
  id_offre: number;

  @Column({ name: 'titre_poste', type: 'varchar', length: 255 })
  titre_poste: string;

  @Column({ name: 'entreprise', type: 'varchar', length: 255, nullable: true })
  entreprise?: string;

  @Column({ name: 'salaire_moyen', type: 'numeric', precision: 10, scale: 2, nullable: true })
  salaire_moyen?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'date_publication', type: 'date', default: () => 'CURRENT_DATE' })
  date_publication: string; 

  @ManyToOne(() => Ville, { nullable: false })
  @JoinColumn({ name: 'id_ville', referencedColumnName: 'id_ville' })
  ville: Ville;

  @ManyToOne(() => SecteurActivite, { nullable: false })
  @JoinColumn({ name: 'id_secteur', referencedColumnName: 'id_secteur' })
  secteur: SecteurActivite;
}

