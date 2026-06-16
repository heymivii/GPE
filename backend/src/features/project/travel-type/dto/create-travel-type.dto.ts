import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTravelTypeDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;
}
