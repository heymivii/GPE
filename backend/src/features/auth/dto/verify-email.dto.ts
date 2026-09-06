import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty({ message: 'Token de confirmation manquant' })
  token: string;
}
