import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DeadlineReminderService } from './deadline-reminder.service';
import { ProcedureTracking } from './entities/procedure-tracking.entity';
import { NotificationService } from '../notification/notification.service';

const NOW = new Date(2026, 0, 1); // 2026-01-01, local time — matches runReminders' local-date math

const addDays = (base: Date, days: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
};

const mockRepo = () => ({
  find: jest.fn(),
  save: jest.fn(),
});

const buildTracking = (overrides: Partial<any> = {}) => ({
  idProcedureTracking: 1,
  lastReminderDays: null,
  user: { idUser: 1 },
  admin_procedure: { procedureType: 'Visa', daysBeforeDeparture: 0 },
  project: {
    idProject: 1,
    status: 'planning',
    expectedDepartureDate: addDays(NOW, 30),
  },
  ...overrides,
});

describe('DeadlineReminderService', () => {
  let service: DeadlineReminderService;
  let trackingRepo: any;
  let notifications: jest.Mocked<NotificationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeadlineReminderService,
        {
          provide: getRepositoryToken(ProcedureTracking),
          useFactory: mockRepo,
        },
        { provide: NotificationService, useValue: { create: jest.fn() } },
      ],
    }).compile();

    service = module.get<DeadlineReminderService>(DeadlineReminderService);
    trackingRepo = module.get(getRepositoryToken(ProcedureTracking));
    notifications = module.get(NotificationService);
    trackingRepo.save.mockImplementation((t: any) => Promise.resolve(t));
    notifications.create.mockResolvedValue(undefined as any);
  });

  describe('handleCron()', () => {
    it('logs when reminders were sent', async () => {
      const logSpy = jest
        .spyOn((service as any).logger, 'log')
        .mockImplementation(() => undefined);
      jest.spyOn(service, 'runReminders').mockResolvedValue(2);

      await service.handleCron();

      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('rappel'));
    });

    it('does not log when nothing was sent', async () => {
      const logSpy = jest
        .spyOn((service as any).logger, 'log')
        .mockImplementation(() => undefined);
      jest.spyOn(service, 'runReminders').mockResolvedValue(0);

      await service.handleCron();

      expect(logSpy).not.toHaveBeenCalled();
    });
  });

  it('sends a J-30 reminder and records the milestone', async () => {
    const tracking = buildTracking();
    trackingRepo.find.mockResolvedValue([tracking]);

    const sent = await service.runReminders(NOW);

    expect(sent).toBe(1);
    expect(notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        contextType: 'project',
        contextId: 1,
        message: expect.stringContaining('J-30'),
      }),
    );
    expect(tracking.lastReminderDays).toBe(30);
    expect(trackingRepo.save).toHaveBeenCalledWith(tracking);
  });

  it('re-notifies at J-7 after a J-30 reminder was already sent', async () => {
    const tracking = buildTracking({
      lastReminderDays: 30,
      project: {
        idProject: 1,
        status: 'planning',
        expectedDepartureDate: addDays(NOW, 7),
      },
    });
    trackingRepo.find.mockResolvedValue([tracking]);

    const sent = await service.runReminders(NOW);

    expect(sent).toBe(1);
    expect(tracking.lastReminderDays).toBe(7);
  });

  it('does not resend the same milestone twice', async () => {
    const tracking = buildTracking({
      lastReminderDays: 30,
      project: {
        idProject: 1,
        status: 'planning',
        expectedDepartureDate: addDays(NOW, 15),
      },
    });
    trackingRepo.find.mockResolvedValue([tracking]);

    const sent = await service.runReminders(NOW);

    expect(sent).toBe(0);
    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('skips trackings whose deadline has already passed', async () => {
    const tracking = buildTracking({
      project: {
        idProject: 1,
        status: 'planning',
        expectedDepartureDate: addDays(NOW, -5),
      },
    });
    trackingRepo.find.mockResolvedValue([tracking]);

    const sent = await service.runReminders(NOW);

    expect(sent).toBe(0);
    expect(notifications.create).not.toHaveBeenCalled();
  });

  it('skips trackings missing a departure date or daysBeforeDeparture', async () => {
    const noDeparture = buildTracking({
      project: {
        idProject: 1,
        status: 'planning',
        expectedDepartureDate: null,
      },
    });
    const noDbd = buildTracking({
      admin_procedure: { procedureType: 'Visa', daysBeforeDeparture: null },
    });
    trackingRepo.find.mockResolvedValue([noDeparture, noDbd]);

    const sent = await service.runReminders(NOW);

    expect(sent).toBe(0);
  });

  it('skips projects that are not planning or active', async () => {
    const tracking = buildTracking({
      project: {
        idProject: 1,
        status: 'completed',
        expectedDepartureDate: addDays(NOW, 30),
      },
    });
    trackingRepo.find.mockResolvedValue([tracking]);

    const sent = await service.runReminders(NOW);

    expect(sent).toBe(0);
  });

  it('continues processing remaining trackings when a notification fails, without counting it as sent', async () => {
    const failing = buildTracking({ idProcedureTracking: 1 });
    const succeeding = buildTracking({
      idProcedureTracking: 2,
      user: { idUser: 2 },
    });
    trackingRepo.find.mockResolvedValue([failing, succeeding]);
    notifications.create
      .mockRejectedValueOnce(new Error('notif down'))
      .mockResolvedValueOnce(undefined as any);

    const sent = await service.runReminders(NOW);

    expect(sent).toBe(1);
    expect(failing.lastReminderDays).toBeNull();
    expect(succeeding.lastReminderDays).toBe(30);
  });
});
