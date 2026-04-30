import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    const user = await this.userService.findOne(req.user.userId);

    const { password: _h1, ...result } = user;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userService.update(
      req.user.userId,
      updateUserDto,
    );

    const { password: _h2, ...result } = updatedUser;
    return result;
  }

  @Delete('me')
  async deleteAccount(@Request() req) {
    await this.userService.remove(req.user.userId);
    return { message: 'Compte supprimé avec succès' };
  }

  @ApiOperation({ summary: 'List all users (Admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/all')
  async findAll() {
    const users = await this.userService.findAll();
    return users.map((user) => {
      const { password: _pw, ...sanitized } = user;
      return sanitized;
    });
  }

  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/stats')
  async getStats() {
    return this.userService.getStats();
  }
}
