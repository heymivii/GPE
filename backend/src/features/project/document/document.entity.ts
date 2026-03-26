import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('document')
export class Document {
  @PrimaryGeneratedColumn({name: 'id_document'})
  idDocument: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;
}
