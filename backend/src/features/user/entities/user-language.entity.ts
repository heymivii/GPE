import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Language } from '../../geography/language/language.entity';

@Entity('user_language')
export class UserLanguage{
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'language_id' })
  languageId: number;

  @Column({name: 'level', type: 'varchar', length: 50})
  level: string;

  @ManyToOne(() => User)
  @JoinColumn({name: 'user_id'})
  user: User

  @ManyToOne(() => Language)
  @JoinColumn({name: 'language_id'})
  language: Language
}