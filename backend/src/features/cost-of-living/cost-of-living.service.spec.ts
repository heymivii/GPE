import { Test, TestingModule } from '@nestjs/testing';
import { CostOfLivingService } from './cost-of-living.service';

describe('CostOfLivingService', () => {
  let service: CostOfLivingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CostOfLivingService],
    }).compile();

    service = module.get<CostOfLivingService>(CostOfLivingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
