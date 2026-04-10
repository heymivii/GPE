import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('travel_type')
export class TravelType {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;
}
