import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  UseGuards,
  Request,
  Query,
  Param,
  ParseIntPipe,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto, ADMIN_LEVEL_ROLES } from './dto/update-role.dto';
import { VerifyExpertDto } from './dto/verify-expert.dto';
import { UpdateExpertProfileDto } from './dto/update-expert-profile.dto';
import { AdminLogService } from '../admin-log/admin-log.service';

@ApiTags('User')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly adminLogService: AdminLogService,
  ) {}

  // ── F1 : réseau d'experts vérifiés ──────────────────────────────

  @ApiOperation({ summary: 'List verified experts (public)' })
  @Get('experts')
  findExperts(
    @Query('countryId') countryId?: string,
    @Query('q') q?: string,
  ) {
    const cid = countryId ? parseInt(countryId, 10) : undefined;
    return this.userService.findExperts(
      Number.isNaN(cid as number) ? undefined : cid,
      q,
    );
  }

  @ApiOperation({ summary: 'Verify a user as an expert (Admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post(':id/verify-expert')
  async verifyExpert(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerifyExpertDto,
    @Request() req,
  ) {
    const updated = await this.userService.verifyExpert(id, dto, req.user.userId);
    await this.adminLogService.log(
      req.user.userId,
      'UPDATE',
      'User',
      id.toString(),
      `Vérification expert : "${updated.email}" (${dto.expertTitle ?? ''})`,
    );
    const { password: _pw, ...result } = updated;
    return result;
  }

  @ApiOperation({ summary: 'Revoke an expert verification (Admin only)' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id/verify-expert')
  async revokeExpert(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const updated = await this.userService.revokeExpert(id);
    await this.adminLogService.log(
      req.user.userId,
      'UPDATE',
      'User',
      id.toString(),
      `Révocation du statut expert : "${updated.email}"`,
    );
    const { password: _pw, ...result } = updated;
    return result;
  }

  @ApiOperation({ summary: 'Update my own expert title/bio (verified expert)' })
  @UseGuards(JwtAuthGuard)
  @Patch('me/expert-profile')
  async updateExpertProfile(
    @Request() req,
    @Body() dto: UpdateExpertProfileDto,
  ) {
    const updated = await this.userService.updateExpertProfile(
      req.user.userId,
      dto,
    );
    const { password: _pw, ...result } = updated;
    return result;
  }

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

  @UseGuards(JwtAuthGuard)
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
    // Never let the system lose its last admin via a demotion.
    const isDemotingAdmin =
      ADMIN_LEVEL_ROLES.includes(targetUser.roles) &&
      !ADMIN_LEVEL_ROLES.includes(dto.role);
    if (isDemotingAdmin) {
      const adminCount = await this.userService.countByRoles(ADMIN_LEVEL_ROLES);
      if (adminCount <= 1) {
        throw new ConflictException(
          'Impossible : il doit rester au moins un administrateur.',
        );
      }
    }
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
