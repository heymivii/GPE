import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Country } from '../../country/entities/country.entity';

@Entity({ name: 'forum_topic' })
export class ForumTopic {
  @PrimaryGeneratedColumn({ name: 'topic_id' })
  topic_id: number;

  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'category', type: 'varchar', length: 50, nullable: true })
  category?: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'id_user' })
  user: User;

  @ManyToOne(() => Country, { nullable: false })
  @JoinColumn({ name: 'country_id'})
  country: Country;
}

