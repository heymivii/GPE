import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CityComparisonService } from './city-comparison.service';
import { CityComparison } from './entities/city-comparison.entity';

describe('CityComparisonService', () => {
  let service: CityComparisonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityComparisonService,
        {
          provide: getRepositoryToken(CityComparison),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CityComparisonService>(CityComparisonService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
