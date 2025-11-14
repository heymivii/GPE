import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JobOfferService } from './job-offer.service';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

@Controller('job-offer')
export class JobOfferController {
  constructor(private readonly jobOfferService: JobOfferService) {}

  @Post()
  create(@Body() createJobOfferDto: CreateJobOfferDto) {
    return this.jobOfferService.create(createJobOfferDto);
  }

  @Get()
  findAll() {
    return this.jobOfferService.findAll();
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
