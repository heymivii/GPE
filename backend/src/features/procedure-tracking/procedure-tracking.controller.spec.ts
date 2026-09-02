import { Test, TestingModule } from '@nestjs/testing';
import { ProcedureTrackingController } from './procedure-tracking.controller';
import { ProcedureTrackingService } from './procedure-tracking.service';
import { DeadlineReminderService } from './deadline-reminder.service';

const mockService = () => ({
  create: jest.fn(),
  findAllByUser: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getBuddies: jest.fn(),
});

describe('ProcedureTrackingController', () => {
  let controller: ProcedureTrackingController;
  let service: ReturnType<typeof mockService>;
  let deadlineReminder: { runReminders: jest.Mock };

  beforeEach(async () => {
    service = mockService();
    deadlineReminder = { runReminders: jest.fn().mockResolvedValue(0) };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcedureTrackingController],
      providers: [
        {
          provide: ProcedureTrackingService,
          useValue: service,
        },
        {
          provide: DeadlineReminderService,
          useValue: deadlineReminder,
        },
      ],
    }).compile();

    controller = module.get<ProcedureTrackingController>(
      ProcedureTrackingController,
    );
  });

  const req = { user: { userId: 7 } } as any;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('runReminders()', () => {
    it('should delegate to deadlineReminderService and wrap the count', async () => {
      deadlineReminder.runReminders.mockResolvedValue(3);
      const result = await controller.runReminders();
      expect(deadlineReminder.runReminders).toHaveBeenCalled();
      expect(result).toEqual({ sent: 3 });
    });
  });

  describe('create()', () => {
    it('should delegate to service.create() with the user id', () => {
      const dto = { title: 'Visa' } as any;
      controller.create(req, dto);
      expect(service.create).toHaveBeenCalledWith(7, dto);
    });
  });

  describe('findAll()', () => {
    it('should pass undefined projectId when not provided', () => {
      controller.findAll(req, undefined);
      expect(service.findAllByUser).toHaveBeenCalledWith(7, undefined);
    });

    it('should parse a numeric projectId', () => {
      controller.findAll(req, '12');
      expect(service.findAllByUser).toHaveBeenCalledWith(7, 12);
    });
  });

  describe('findOne()', () => {
    it('should delegate to service.findOne() with numeric id and user id', () => {
      controller.findOne(req, '5');
      expect(service.findOne).toHaveBeenCalledWith(5, 7);
    });
  });

  describe('getBuddies()', () => {
    it('should parse the query params and delegate to service.getBuddies()', () => {
      controller.getBuddies(req, '5', '10');
      expect(service.getBuddies).toHaveBeenCalledWith(5, 10, 7);
    });
  });

  describe('update()', () => {
    it('should delegate to service.update()', () => {
      const dto = { title: 'Updated' } as any;
      controller.update(req, '5', dto);
      expect(service.update).toHaveBeenCalledWith(5, 7, dto);
    });
  });

  describe('remove()', () => {
    it('should delegate to service.remove()', () => {
      controller.remove(req, '5');
      expect(service.remove).toHaveBeenCalledWith(5, 7);
    });
  });
});
