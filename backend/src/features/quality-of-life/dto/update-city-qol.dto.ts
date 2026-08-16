import { IsNumber, IsOptional } from 'class-validator';

/**
 * Manual admin edit of a city's quality-of-life indices. Every field optional;
 * `null` explicitly clears a value (IsOptional lets null through unvalidated).
 */
export class UpdateCityQolDto {
  @IsOptional() @IsNumber() qualityOfLife?: number | null;
  @IsOptional() @IsNumber() purchasingPower?: number | null;
  @IsOptional() @IsNumber() safety?: number | null;
  @IsOptional() @IsNumber() healthCare?: number | null;
  @IsOptional() @IsNumber() costOfLiving?: number | null;
  @IsOptional() @IsNumber() propertyPriceToIncome?: number | null;
  @IsOptional() @IsNumber() trafficCommuteTime?: number | null;
  @IsOptional() @IsNumber() pollution?: number | null;
  @IsOptional() @IsNumber() climate?: number | null;
}
