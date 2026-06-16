import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProcedureTrackingService } from './procedure-tracking.service';
import { ProcedureTracking } from './entities/procedure-tracking.entity';

describe('ProcedureTrackingService', () => {
  let service: ProcedureTrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcedureTrackingService,
        {
          provide: getRepositoryToken(ProcedureTracking),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ProcedureTrackingService>(ProcedureTrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
