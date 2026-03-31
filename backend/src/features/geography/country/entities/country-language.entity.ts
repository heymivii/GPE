import { Country } from 'src/features/country/entities/country.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Language } from '../../language/language.entity';

@Entity('country_language')
export class CountryLanguage {
  @PrimaryColumn({ name: 'country_id' })
  idCountry: number;

  @PrimaryColumn({ name: 'language_id' })
  idLanguage: number;

  @Column({ name: 'is_official', type: 'boolean', default: false })
  is_official: boolean;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @ManyToOne(() => Language)
  @JoinColumn({ name: 'language_id' })
  language: Language;
}
