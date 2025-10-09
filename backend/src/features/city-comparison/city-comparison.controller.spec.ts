import { Test, TestingModule } from '@nestjs/testing';
import { CityComparisonController } from './city-comparison.controller';
import { CityComparisonService } from './city-comparison.service';

describe('CityComparisonController', () => {
  let controller: CityComparisonController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityComparisonController],
      providers: [CityComparisonService],
    }).compile();

    controller = module.get<CityComparisonController>(CityComparisonController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
