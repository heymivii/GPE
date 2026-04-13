import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { City } from '../../city/entities/city.entity';

@Entity({ name: 'city_comparison' })
export class CityComparison {
  @PrimaryGeneratedColumn({ name: 'id_city_comparison' })
  idCityComparison: number;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'city_id' })
  cityId: number;

  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'city_id' })
  city: City;
}
