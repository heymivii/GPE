import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AdminLogService } from './admin-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Admin Logs')
@Controller('admin-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminLogController {
  constructor(private readonly adminLogService: AdminLogService) {}

  @ApiOperation({ summary: 'Get all administrative activity logs' })
  @Get()
  async findAll() {
    const logs = await this.adminLogService.findAll();
    return logs.map((log) => {
      if (log.user) {
        const { password, ...sanitizedUser } = log.user;
        log.user = sanitizedUser as any;
      }
      return log;
    });
  }
}
