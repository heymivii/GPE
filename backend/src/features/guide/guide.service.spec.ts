import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GuideService } from './guide.service';
import { Guide } from './entities/guide.entity';

describe('GuideService', () => {
  let service: GuideService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GuideService,
        {
          provide: getRepositoryToken(Guide),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<GuideService>(GuideService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
