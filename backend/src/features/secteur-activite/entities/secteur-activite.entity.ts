import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'secteur_activite' }) 
export class SecteurActivite {
  @PrimaryGeneratedColumn({ name: 'id_secteur' })
  id_secteur: number; 

  @Column({ name: 'nom_secteur', type: 'varchar', length: 100, nullable: false })
  nom_secteur: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;
}

