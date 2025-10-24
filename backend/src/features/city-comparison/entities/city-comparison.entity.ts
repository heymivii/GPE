import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { City } from '../../city/entities/city.entity';

@Entity({ name: 'city_comparison' })
export class CityComparison {
  @PrimaryGeneratedColumn({ name: 'comparison_id' })
  comparison_id: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  user: User;

  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'city_id', referencedColumnName: 'city_id' })
  city: City;
}
