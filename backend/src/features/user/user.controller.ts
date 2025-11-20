import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // Récupérer le profil de l'utilisateur connecté
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.userService.findOne(req.user.userId);
    // Ne pas retourner le mot de passe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }

  // Mettre à jour le profil de l'utilisateur connecté
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(
      req.user.userId,
      updateUserDto,
    );
    // Ne pas retourner le mot de passe
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = updatedUser;
    return result;
  }

  // Supprimer le compte de l'utilisateur connecté
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteAccount(@Request() req) {
    await this.userService.remove(req.user.userId);
    return { message: 'Compte supprimé avec succès' };
  }
}
