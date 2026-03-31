import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('visa_requirement')
export class VisaRequirement {
  @PrimaryGeneratedColumn({name: 'id_visa_requirement'})
  idVisaRequirement: number;

  @Column({ name: 'origin_country' })
  origin_country: string;

  @Column({ name: 'destination_country' })
  destination_country: string;

  @Column({ name: 'visa_type' })
  visa_type: string;

  @Column({ type: 'int', nullable: true })
  duration_days: number;

  @Column({ type: 'text', nullable: true })
  description: string;
}
