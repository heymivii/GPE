export interface User {
  idUser: number;  // Le backend renvoie idUser
  id?: number;     // Alias optionnel pour compatibilité
  email: string;
  fullName: string;
  role?: 'USER' | 'ADMIN';
  userRole?: string;  // Le backend renvoie userRole
  age?: number;
  status?: string;
  languageLevel?: string;
  idOriginCountry?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  age?: number;
  status?: string;
  languageLevel?: string;
  idOriginCountry?: number;
}

export interface UpdateProfileDto {
  fullName?: string;
  age?: number;
  status?: string;
  languageLevel?: string;
  idOriginCountry?: number;
  password?: string; // Optionnel pour changer le mot de passe
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface RefreshTokenDto {
  refreshToken: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}
