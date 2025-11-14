import { IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCostOfLivingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  averageRent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  monthlyTransport?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  foodExpenses?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  publicServices?: number;

  @IsNotEmpty()
  @IsNumber()
  idCity: number;
}
