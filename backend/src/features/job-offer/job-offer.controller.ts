import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';
import { SearchJobDto } from './dto/search-job.dto';
import { AdzunaService } from './adzuna.service';

@Controller('job-offer')
export class JobOfferController {
  constructor(
    private readonly jobOfferService: JobOfferService,
    private readonly adzunaService: AdzunaService,
  ) {}

  @Post()
  create(@Body() createJobOfferDto: CreateJobOfferDto) {
    return this.jobOfferService.create(createJobOfferDto);
  }

  @Get()
  findAll() {
    return this.jobOfferService.findAll();
  }

  /**
   * Rechercher des offres d'emploi via Adzuna
   * GET /job-offer/search?country=fr&city=Paris&keyword=developer&page=1
   * IMPORTANT: Must be BEFORE @Get(':id') to avoid route conflicts
   */
  @Get('search')
  async searchJobs(@Query() searchDto: SearchJobDto) {
    return this.adzunaService.searchJobs(searchDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobOfferService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobOfferDto: UpdateJobOfferDto) {
    return this.jobOfferService.update(+id, updateJobOfferDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobOfferService.remove(+id);
  }
}
