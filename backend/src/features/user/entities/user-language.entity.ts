import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Language } from 'src/features/geography/language/language.entity';

@Entity('user_language')
export class UserLanguage{
  @PrimaryColumn({ name: 'id_user' })
  idUser: number;

  @PrimaryColumn({ name: 'id_language' })
  idLanguage: number;

  @Column({name: 'level', type: 'varchar', length: 50})
  level: string;

  @ManyToOne(() => User)
  @JoinColumn({name: 'id_user'})
  user: User

  @ManyToOne(() => Language)
  @JoinColumn({name: 'id_language'})
  language: Language
}