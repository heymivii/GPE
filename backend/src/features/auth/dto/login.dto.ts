import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString()
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
  })
  password: string;

  /**
   * « Se souvenir de moi ». Absent ou false, la session ne survit pas à la
   * fermeture du navigateur : le cookie devient un cookie de session et le
   * client garde le refresh token en sessionStorage.
   */
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
