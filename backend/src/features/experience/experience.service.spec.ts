import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ExperienceService } from './experience.service';
import { Experience } from './entities/experience.entity';

describe('ExperienceService', () => {
  let service: ExperienceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExperienceService,
        {
          provide: getRepositoryToken(Experience),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ExperienceService>(ExperienceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
