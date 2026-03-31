import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Country } from '../../country/entities/country.entity';

@Entity({ name: 'resource' })
export class Resource {
  @PrimaryGeneratedColumn({ name: 'id_resource' })
  resource_id: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'url', type: 'varchar', length: 500, nullable: true })
  url?: string;

  @Column({
    name: 'resource_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  resource_type?: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'country_id' })
  country: Country;
}
