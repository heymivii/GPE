import { Test, TestingModule } from '@nestjs/testing';
import { CostOfLivingController } from './cost-of-living.controller';
import { CostOfLivingService } from './cost-of-living.service';

describe('CostOfLivingController', () => {
  let controller: CostOfLivingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CostOfLivingController],
      providers: [CostOfLivingService],
    }).compile();

    controller = module.get<CostOfLivingController>(CostOfLivingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
