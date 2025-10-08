import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Pays } from '../../pays/entities/pays.entity';

@Entity('continent')
export class Continent {
  @PrimaryGeneratedColumn({ name: 'id_continent' })
  id_continent: number;

  @Column({ name: 'nom_continent', type: 'varchar', length: 50 })
  nom: string;

  @Column({ name: 'code_iso', type: 'char', length: 2, unique: true })
  codeIso: string;

  @OneToMany(() => Pays, (p) => p.continent)
  pays?: Pays[];
}


