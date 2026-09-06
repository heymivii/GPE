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
  countryOriginId?: number;
  /** Adresse email confirmée via le lien reçu à l'inscription. */
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginDto {
  email: string;
  password: string;
  /**
   * « Se souvenir de moi ». false/absent : la session ne survit pas à la
   * fermeture du navigateur (cookie de session + jetons en sessionStorage).
   */
  rememberMe?: boolean;
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
  countryOriginId?: number;
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
  countryOriginId?: number;
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
