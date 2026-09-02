import { Test, TestingModule } from '@nestjs/testing';
import { UserReportController } from './user-report.controller';
import { UserReportService } from './user-report.service';

describe('UserReportController', () => {
  let controller: UserReportController;
  let service: jest.Mocked<UserReportService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserReportController],
      providers: [
        {
          provide: UserReportService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            stats: jest.fn(),
            resolve: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserReportController>(UserReportController);
    service = module.get(UserReportService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create uses the authenticated user as reporter', () => {
    const dto = { reportedUserId: 2, reason: 'spam' } as any;
    const req = { user: { userId: 1 } };
    controller.create(req, dto);
    expect(service.create).toHaveBeenCalledWith(1, dto);
  });

  describe('findAll', () => {
    it('passes the status filter through', () => {
      controller.findAll('pending');
      expect(service.findAll).toHaveBeenCalledWith('pending');
    });

    it('passes undefined when no status is given', () => {
      controller.findAll(undefined);
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });
  });

  it('stats delegates to the service', () => {
    controller.stats();
    expect(service.stats).toHaveBeenCalled();
  });

  it('resolve uses the authenticated user as moderator', () => {
    const req = { user: { userId: 42 } };
    const body = { action: 'resolved' as const, moderatorNote: 'ok' };
    controller.resolve(1, req, body);
    expect(service.resolve).toHaveBeenCalledWith(1, 42, 'resolved', 'ok');
  });
});
