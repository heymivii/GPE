import { Test, TestingModule } from '@nestjs/testing';
import { CityComparisonService } from './city-comparison.service';

describe('CityComparisonService', () => {
  let service: CityComparisonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CityComparisonService],
    }).compile();

    service = module.get<CityComparisonService>(CityComparisonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
