import { IsNumber, IsOptional } from 'class-validator';

/**
 * Manual admin edit of a city's property-investment indicators. Every field optional;
 * `null` explicitly clears a value (IsOptional lets null through unvalidated).
 */
export class UpdateCityPropertyDto {
  @IsOptional() @IsNumber() priceToIncomeRatio?: number | null;
  @IsOptional() @IsNumber() mortgageAsPctIncome?: number | null;
  @IsOptional() @IsNumber() loanAffordabilityIndex?: number | null;
  @IsOptional() @IsNumber() priceToRentCityCentre?: number | null;
  @IsOptional() @IsNumber() priceToRentOutside?: number | null;
  @IsOptional() @IsNumber() grossRentalYieldCityCentre?: number | null;
  @IsOptional() @IsNumber() grossRentalYieldOutside?: number | null;
  @IsOptional() @IsNumber() gdpPerCapita?: number | null;
  @IsOptional() @IsNumber() gdpGrowthRate?: number | null;
  @IsOptional() @IsNumber() populationGrowthRate?: number | null;
}
