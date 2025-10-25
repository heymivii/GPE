import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ProcedureTrackingService } from './procedure-tracking.service';
import { CreateProcedureTrackingDto } from './dto/create-procedure-tracking.dto';
import { UpdateProcedureTrackingDto } from './dto/update-procedure-tracking.dto';

@Controller('procedure-tracking')
export class ProcedureTrackingController {
  constructor(
    private readonly procedureTrackingService: ProcedureTrackingService,
  ) {}

  @Post()
  create(@Body() createProcedureTrackingDto: CreateProcedureTrackingDto) {
    return this.procedureTrackingService.create(createProcedureTrackingDto);
  }

  @Get()
  findAll() {
    return this.procedureTrackingService.findAll();
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
