import { Test, TestingModule } from '@nestjs/testing';
import { JobOfferService } from './job-offer.service';

describe('JobOfferService', () => {
  let service: JobOfferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobOfferService],
    }).compile();

    service = module.get<JobOfferService>(JobOfferService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
