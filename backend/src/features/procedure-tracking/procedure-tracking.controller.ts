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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProcedureTrackingService } from './procedure-tracking.service';
import { CreateProcedureTrackingDto } from './dto/create-procedure-tracking.dto';
import { UpdateProcedureTrackingDto } from './dto/update-procedure-tracking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Procedure Tracking')
@Controller('procedure-tracking')
@UseGuards(JwtAuthGuard)
export class ProcedureTrackingController {
  constructor(
    private readonly procedureTrackingService: ProcedureTrackingService,
  ) {}

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
  findAll(@Request() req) {
    return this.procedureTrackingService.findAllByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.procedureTrackingService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProcedureTrackingDto: UpdateProcedureTrackingDto,
  ) {
    return this.procedureTrackingService.update(
      +id,
      updateProcedureTrackingDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.procedureTrackingService.remove(+id);
  }
}
