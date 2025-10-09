import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'industry_sector' })
export class IndustrySector {
  @PrimaryGeneratedColumn({ name: 'sector_id' })
  sector_id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;
}

