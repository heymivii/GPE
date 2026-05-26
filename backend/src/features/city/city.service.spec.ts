import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CityService } from './city.service';
import { City } from './entities/city.entity';

describe('CityService', () => {
  let service: CityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityService,
        {
          provide: getRepositoryToken(City),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CityService>(CityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
