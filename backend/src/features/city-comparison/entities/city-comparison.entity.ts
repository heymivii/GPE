import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { City } from '../../city/entities/city.entity';

@Entity({ name: 'city_comparison' })
export class CityComparison {
  @PrimaryGeneratedColumn({ name: 'id_comparison' })
  id_comparison: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'city_id' })
  city: City;
}
