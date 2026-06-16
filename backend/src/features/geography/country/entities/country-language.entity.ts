import { Country } from '../../../country/entities/country.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Language } from '../../language/language.entity';

@Entity('country_language')
export class CountryLanguage {
  @PrimaryColumn({ name: 'country_id' })
  countryId: number;

  @PrimaryColumn({ name: 'language_id' })
  languageId: number;

  @Column({ name: 'is_official', type: 'boolean', default: false })
  isOfficial: boolean;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @ManyToOne(() => Language)
  @JoinColumn({ name: 'language_id' })
  language: Language;
}
