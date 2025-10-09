import { Test, TestingModule } from '@nestjs/testing';
import { ProcedureTrackingService } from './procedure-tracking.service';

describe('ProcedureTrackingService', () => {
  let service: ProcedureTrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcedureTrackingService],
    }).compile();

    service = module.get<ProcedureTrackingService>(ProcedureTrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
