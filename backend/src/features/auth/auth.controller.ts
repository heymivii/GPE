// 📍 EMPLACEMENT: backend/src/features/auth/auth.controller.ts

import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  UseGuards, 
  Request,
  Response,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
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
   * Envoie le token JWT dans un cookie HTTP-Only
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() registerDto: RegisterDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.authService.register(registerDto);
    
    // Définir le cookie HTTP-Only avec le token
    res.cookie('access_token', result.access_token, {
      httpOnly: true,  // Inaccessible via JavaScript
      secure: process.env.NODE_ENV === 'production',  // HTTPS en production
      sameSite: 'lax',  // Protection CSRF
      maxAge: 24 * 60 * 60 * 1000,  // 24 heures
    });

    // Retourner les infos utilisateur sans le token
    return {
      message: result.message,
      user: result.user,
    };
  }

  /**
   * 📌 POST /api/auth/login
   * Connexion d'un utilisateur
   * Envoie le token JWT dans un cookie HTTP-Only
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginDto,
    @Response({ passthrough: true }) res: ExpressResponse,
  ) {
    const result = await this.authService.login(loginDto);
    
    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    return {
      message: result.message,
      user: result.user,
    };
  }

  /**
   * 📌 GET /api/auth/profile
   * Récupérer le profil de l'utilisateur connecté (protégé)
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    return this.authService.getProfile(req.user.userId);
  }

  /**
   * 📌 POST /api/auth/logout
   * Déconnexion - Supprime le cookie HTTP-Only
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Response({ passthrough: true }) res: ExpressResponse) {
    // Supprimer le cookie
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
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