import { Test, TestingModule } from '@nestjs/testing';
import { AdminStatsController } from './admin-stats.controller';
import { AdminStatsService } from './admin-stats.service';

describe('AdminStatsController', () => {
  let controller: AdminStatsController;
  let service: jest.Mocked<AdminStatsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminStatsController],
      providers: [
        {
          provide: AdminStatsService,
          useValue: { getGlobalStats: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AdminStatsController>(AdminStatsController);
    service = module.get(AdminStatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getGlobalStats delegates to the service', async () => {
    const stats = { counts: {} };
    service.getGlobalStats.mockResolvedValue(stats as any);
    const result = await controller.getGlobalStats();
    expect(service.getGlobalStats).toHaveBeenCalled();
    expect(result).toBe(stats);
  });
});
