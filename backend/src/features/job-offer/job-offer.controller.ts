import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { SearchJobDto } from './dto/search-job.dto';
import { AdzunaService } from './adzuna.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Job Offer')
@Controller('job-offer')
export class JobOfferController {
  constructor(
    private readonly jobOfferService: JobOfferService,
    private readonly adzunaService: AdzunaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createJobOfferDto: CreateJobOfferDto) {
    return this.jobOfferService.create(createJobOfferDto);
  }

  @Get()
  findAll() {
    return this.jobOfferService.findAll();
  }

  @Get('search')
  async searchJobs(@Query() searchDto: SearchJobDto) {
    return this.adzunaService.searchJobs(searchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobOfferService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateJobOfferDto: UpdateJobOfferDto,
  ) {
    return this.jobOfferService.update(+id, updateJobOfferDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.jobOfferService.remove(+id);
  }
}
