import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('travel_type')
export class TravelType {
  @PrimaryGeneratedColumn({name: 'id_travel_type'})
  id_travel_type: number;

  @Column({ type: 'varchar', length: 50 })
  name: string;
}
