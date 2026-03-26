import { Country } from 'src/features/country/entities/country.entity';
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryColumn } from 'typeorm';
import { Language } from '../../language/language.entity';
import { Currency } from '../../currency/currency.entity';

@Entity('country_currency')
export class CountryCurrency{
  @PrimaryColumn({ name: 'id_country' })
  idCountry: number;

  @PrimaryColumn({ name: 'id_currency' })
  idCurrency: number;

  @Column({name: 'is_primary', type: 'boolean', default: false})
  is_primary: boolean;

  @ManyToOne(() => Country)
  @JoinColumn({name: 'id_country'})
  country: Country

  @ManyToOne(() => Currency)
  @JoinColumn({name: 'id_currency'})
  currency: Currency
}
