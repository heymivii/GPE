// src/features/experience/entities/experience.entity.ts
import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Country } from '../../country/entities/country.entity';

@Entity({ name: 'experience' })
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class Experience {
  @PrimaryGeneratedColumn({ name: 'experience_id' })
  experience_id: number;

  @Column({ name: 'title', type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'rating', type: 'integer', nullable: true })
  rating?: number;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'country_id', referencedColumnName: 'country_id' })
  country: Country;
}

