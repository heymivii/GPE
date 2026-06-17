import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CostOfLivingController } from './cost-of-living.controller';
import { CostOfLivingService } from './cost-of-living.service';
import { AdminLogService } from '../admin-log/admin-log.service';
import { City } from '../city/entities/city.entity';

describe('CostOfLivingController', () => {
  let controller: CostOfLivingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CostOfLivingController],
      providers: [
        {
          provide: CostOfLivingService,
          useValue: {
            getCostOfLiving: jest.fn(),
            compareCities: jest.fn(),
          },
        },
        {
          provide: AdminLogService,
          useValue: { log: jest.fn() },
        },
        {
          provide: getRepositoryToken(City),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CostOfLivingController>(CostOfLivingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
