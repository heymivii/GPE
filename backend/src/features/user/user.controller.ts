import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AdminLogService } from '../admin-log/admin-log.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly adminLogService: AdminLogService,
  ) {}

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
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.userService.findAll(paginationDto);
    return {
      ...result,
      data: result.data.map((user) => {
        const { password: _pw, ...sanitized } = user;
        return sanitized;
      }),
    };
  }

  @ApiOperation({ summary: 'Update user role (Admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch('admin/:id/role')
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @Request() req,
  ) {
    // Prevent an admin from changing their own role (self-lockout / accidental self-demotion).
    if (id === req.user.userId) {
      throw new ForbiddenException('Vous ne pouvez pas modifier votre propre rôle.');
    }
    const targetUser = await this.userService.findOne(id);
    const updatedUser = await this.userService.updateRole(id, dto.role);
    await this.adminLogService.log(
      req.user.userId,
      'UPDATE',
      'User',
      id.toString(),
      `Changement de rôle de l'utilisateur "${targetUser.firstName || ''} ${targetUser.lastName || ''}" (${targetUser.email}) : "${targetUser.roles}" -> "${dto.role}"`
    );
    const { password: _pw, ...result } = updatedUser;
    return result;
  }

  @ApiOperation({ summary: 'Get user statistics (Admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get('admin/stats')
  async getStats() {
    return this.userService.getStats();
  }
}
