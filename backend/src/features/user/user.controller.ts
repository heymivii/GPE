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

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.userService.findOne(req.user.userId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(
      req.user.userId,
      updateUserDto,
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = updatedUser;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteAccount(@Request() req) {
    await this.userService.remove(req.user.userId);
    return { message: 'Compte supprimé avec succès' };
  }
}
