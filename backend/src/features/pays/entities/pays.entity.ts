import { Column, Entity, ManyToOne, JoinColumn, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Continent } from '../../continent/entities/continent.entity';
import { Ville } from '../../ville/entities/ville.entity';

@Entity({ name: 'pays' }) 
export class Pays {
  @PrimaryGeneratedColumn({ name: 'id_pays' })
  id_pays: number; 

  @Column({ name: 'nom_pays', type: 'varchar', length: 100, nullable: false })
  nom_pays: string;

  @Column({ name: 'code_iso', type: 'char', length: 2, nullable: false, unique: true })
  code_iso: string;

  @Column({ name: 'devise', type: 'varchar', length: 50, nullable: true })
  devise?: string;

  @Column({ name: 'langue', type: 'text', nullable: true })
  langue?: string;

  @Column({ name: 'infos_visa', type: 'text', nullable: true })
  infos_visa?: string;

  @Column({ name: 'drapeau', type: 'varchar', length: 255, nullable: true })
  drapeau?: string;

  // FK vers continent(id_continent)
  @ManyToOne(() => Continent, { nullable: false })
  @JoinColumn({ name: 'id_continent', referencedColumnName: 'id_continent' })
  continent: Continent;

  @OneToMany(() => Ville, (v) => v.pays)
  villes?: Ville[];

}

