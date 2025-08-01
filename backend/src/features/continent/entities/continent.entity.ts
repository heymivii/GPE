import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Continent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  isoCode: string;
}
