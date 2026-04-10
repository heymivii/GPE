import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity({ name: 'language' })
export class Language {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;
}