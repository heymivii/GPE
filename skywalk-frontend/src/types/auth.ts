export interface User {
  idUser: number;
  id?: number;    
  email: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  role?: 'USER' | 'ADMIN';
  userRole?: string;
  age?: number;
  status?: string;
  languageLevel?: string;
  motherTongue?: string;
  spokenLanguages?: string[];
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
  firstName: string;
  lastName: string;
  age?: number;
  status?: string;
  languageLevel?: string;
  motherTongue?: string;
  spokenLanguages?: string[];
  idOriginCountry?: number;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  age?: number;
  status?: string;
  languageLevel?: string;
  motherTongue?: string;
  spokenLanguages?: string[];
  idOriginCountry?: number;
  password?: string; 
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
