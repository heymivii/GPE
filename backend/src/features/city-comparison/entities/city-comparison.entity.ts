import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { City } from '../../city/entities/city.entity';

@Entity({ name: 'city_comparison' })
export class CityComparison {
  @PrimaryGeneratedColumn({ name: 'comparison_id' })
  comparison_id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'city_id' })
  city: City;
}
