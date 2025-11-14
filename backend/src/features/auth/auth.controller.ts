// 📍 EMPLACEMENT: backend/src/features/auth/auth.controller.ts

import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 📌 POST /api/auth/register
   * Inscription d'un nouvel utilisateur
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * 📌 POST /api/auth/login
   * Connexion d'un utilisateur
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * 📌 GET /api/auth/profile
   * Récupérer le profil de l'utilisateur connecté (protégé)
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  /**
   * 📌 POST /api/auth/logout
   * Déconnexion (côté client, suppression du token)
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout() {
    return { message: 'Déconnexion réussie' };
  }

  /**
   * 📌 POST /api/auth/refresh
   * Rafraîchir le token JWT
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  /**
   * 📌 POST /api/auth/forgot-password
   * Demande de réinitialisation de mot de passe
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  /**
   * 📌 POST /api/auth/reset-password
   * Réinitialisation du mot de passe avec token
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }
}