import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserReportService } from './user-report.service';
import { CreateUserReportDto } from './dto/create-user-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('User Report')
@Controller('user-report')
export class UserReportController {
  constructor(private readonly userReportService: UserReportService) {}

  // Signaler un membre — tout utilisateur authentifié (rapporteur = token).
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() dto: CreateUserReportDto) {
    return this.userReportService.create(req.user.userId, dto);
  }

  // ── Vues admin / modérateur ──
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  findAll(@Query('status') status?: string) {
    return this.userReportService.findAll(status);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  stats() {
    return this.userReportService.stats();
  }

  @Patch(':id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  resolve(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() body: { action: 'resolved' | 'rejected'; moderatorNote?: string },
  ) {
    return this.userReportService.resolve(
      id,
      req.user.userId,
      body.action,
      body.moderatorNote,
    );
  }
}
