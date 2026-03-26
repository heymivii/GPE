import { Country } from 'src/features/country/entities/country.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { Language } from '../../language/language.entity';

@Entity('country_language')
export class CountryLanguage {
  @PrimaryColumn({ name: 'id_country' })
  idCountry: number;

  @PrimaryColumn({ name: 'id_language' })
  idLanguage: number;

  @Column({name: 'is_official', type: 'boolean', default: false})
  is_official: boolean;

  @ManyToOne(() => Country)
  @JoinColumn({name: 'id_country'})
  country: Country


  @ManyToOne(() => Language)
  @JoinColumn({name: 'id_language'})
  language: Language
}
