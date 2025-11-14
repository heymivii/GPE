import { Injectable } from '@nestjs/common';
import { CreateJobOfferDto } from './dto/create-job-offer.dto';
import { UpdateJobOfferDto } from './dto/update-job-offer.dto';

@Injectable()
export class JobOfferService {
  create(createJobOfferDto: CreateJobOfferDto) {
    return 'This action adds a new jobOffer';
  }

  findAll() {
    return `This action returns all jobOffer`;
  }

  findOne(id: number) {
    return `This action returns a #${id} jobOffer`;
  }

  update(id: number, updateJobOfferDto: UpdateJobOfferDto) {
    return `This action updates a #${id} jobOffer`;
  }

  remove(id: number) {
    return `This action removes a #${id} jobOffer`;
  }
}
