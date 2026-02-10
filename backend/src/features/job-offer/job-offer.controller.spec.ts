import { Test, TestingModule } from '@nestjs/testing';
import { JobOfferController } from './job-offer.controller';
import { JobOfferService } from './job-offer.service';
import { AdzunaService } from './adzuna.service';

describe('JobOfferController', () => {
  let controller: JobOfferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOfferController],
      providers: [
        {
          provide: JobOfferService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: AdzunaService,
          useValue: {
            searchJobs: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<JobOfferController>(JobOfferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
