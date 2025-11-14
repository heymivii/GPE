import { Test, TestingModule } from '@nestjs/testing';
import { JobOfferController } from './job-offer.controller';
import { JobOfferService } from './job-offer.service';

describe('JobOfferController', () => {
  let controller: JobOfferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOfferController],
      providers: [JobOfferService],
    }).compile();

    controller = module.get<JobOfferController>(JobOfferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
