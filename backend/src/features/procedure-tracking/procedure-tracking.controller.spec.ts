import { Test, TestingModule } from '@nestjs/testing';
import { ProcedureTrackingController } from './procedure-tracking.controller';
import { ProcedureTrackingService } from './procedure-tracking.service';
import { DeadlineReminderService } from './deadline-reminder.service';

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
        {
          provide: DeadlineReminderService,
          useValue: { runReminders: jest.fn().mockResolvedValue(0) },
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
