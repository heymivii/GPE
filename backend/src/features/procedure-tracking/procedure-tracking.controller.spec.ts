import { Test, TestingModule } from '@nestjs/testing';
import { ProcedureTrackingController } from './procedure-tracking.controller';
import { ProcedureTrackingService } from './procedure-tracking.service';

describe('ProcedureTrackingController', () => {
  let controller: ProcedureTrackingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcedureTrackingController],
      providers: [
        {
          provide: ProcedureTrackingService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ProcedureTrackingController>(
      ProcedureTrackingController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
