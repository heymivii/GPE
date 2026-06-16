import { Country } from '../../../country/entities/country.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Currency } from '../../currency/currency.entity';

@Entity('country_currency')
export class CountryCurrency {
  @PrimaryColumn({ name: 'country_id' })
  countryId: number;

  @PrimaryColumn({ name: 'currency_id' })
  currencyId: number;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @ManyToOne(() => Country)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @ManyToOne(() => Currency)
  @JoinColumn({ name: 'currency_id' })
  currency: Currency;
}
