import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ProcessTrackingService } from './process-tracking.service';
import { CreateProcessTrackingDto } from './dto/create-process-tracking.dto';
import { UpdateProcessTrackingDto } from './dto/update-process-tracking.dto';

@Controller('process-tracking')
export class ProcessTrackingController {
  constructor(
    private readonly processTrackingService: ProcessTrackingService,
  ) {}

  @Post()
  create(@Body() createProcessTrackingDto: CreateProcessTrackingDto) {
    return this.processTrackingService.create(createProcessTrackingDto);
  }

  @Get()
  findAll(
    @Query('userId', ParseIntPipe) userId?: number,
    @Query('projectId', ParseIntPipe) projectId?: number,
  ) {
    if (userId) {
      return this.processTrackingService.findByUser(userId);
    }
    if (projectId) {
      return this.processTrackingService.findByProject(projectId);
    }
    return this.processTrackingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.processTrackingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProcessTrackingDto: UpdateProcessTrackingDto,
  ) {
    return this.processTrackingService.update(id, updateProcessTrackingDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.processTrackingService.remove(id);
  }
}
