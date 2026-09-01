import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProcedureTrackingService } from './procedure-tracking.service';
import { DeadlineReminderService } from './deadline-reminder.service';
import { CreateProcedureTrackingDto } from './dto/create-procedure-tracking.dto';
import { UpdateProcedureTrackingDto } from './dto/update-procedure-tracking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Procedure Tracking')
@Controller('procedure-tracking')
@UseGuards(JwtAuthGuard)
export class ProcedureTrackingController {
  constructor(
    private readonly procedureTrackingService: ProcedureTrackingService,
    private readonly deadlineReminderService: DeadlineReminderService,
  ) {}

  // Déclenche manuellement la passe de rappels d'échéance (le cron tourne aussi tous les jours).
  @Post('run-reminders')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async runReminders() {
    const sent = await this.deadlineReminderService.runReminders();
    return { sent };
  }

  @Post()
  create(
    @Request() req,
    @Body() createProcedureTrackingDto: CreateProcedureTrackingDto,
  ) {
    return this.procedureTrackingService.create(
      req.user.userId,
      createProcedureTrackingDto,
    );
  }

  @Get()
  findAll(@Request() req, @Query('projectId') projectId?: string) {
    return this.procedureTrackingService.findAllByUser(
      req.user.userId,
      projectId ? parseInt(projectId, 10) : undefined,
    );
  }

  @Get('buddies')
  getBuddies(
    @Request() req,
    @Query('procedureId') procedureId: string,
    @Query('countryId') countryId: string,
  ) {
    return this.procedureTrackingService.getBuddies(
      parseInt(procedureId, 10),
      parseInt(countryId, 10),
      req.user.userId,
    );
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.procedureTrackingService.findOne(+id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateProcedureTrackingDto: UpdateProcedureTrackingDto,
  ) {
    return this.procedureTrackingService.update(
      +id,
      req.user.userId,
      updateProcedureTrackingDto,
    );
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.procedureTrackingService.remove(+id, req.user.userId);
  }
}
