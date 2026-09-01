import { Test, TestingModule } from '@nestjs/testing';
import { SearchHintController } from './search-hint.controller';
import { SearchHintService } from './search-hint.service';
import { AdminLogService } from '../admin-log/admin-log.service';

describe('SearchHintController', () => {
  let controller: SearchHintController;
  let service: jest.Mocked<SearchHintService>;
  let adminLog: jest.Mocked<AdminLogService>;

  const req = { user: { userId: 1 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchHintController],
      providers: [
        {
          provide: SearchHintService,
          useValue: {
            list: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            seedMissing: jest.fn(),
          },
        },
        { provide: AdminLogService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    controller = module.get<SearchHintController>(SearchHintController);
    service = module.get(SearchHintService);
    adminLog = module.get(AdminLogService);
  });

  it('list passes the country/category filters through', () => {
    controller.list('fr', 'visa');
    expect(service.list).toHaveBeenCalledWith({
      countryCode: 'fr',
      category: 'visa',
    });
  });

  it('findOne delegates to the service with the raw params', () => {
    controller.findOne('fr', 'visa');
    expect(service.findOne).toHaveBeenCalledWith('fr', 'visa');
  });

  it('create persists and logs the admin action', async () => {
    const dto = { countryCode: 'fr', category: 'visa' } as any;
    service.create.mockResolvedValue({
      countryCode: 'FR',
      category: 'visa',
    } as any);

    const result = await controller.create(dto, req);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(adminLog.log).toHaveBeenCalledWith(
      1,
      'CREATE',
      'SearchHint',
      'FR/visa',
      expect.stringContaining('FR/visa'),
    );
    expect(result).toEqual({ countryCode: 'FR', category: 'visa' });
  });

  it('update persists and logs the admin action', async () => {
    const dto = { keywords: 'new' } as any;
    service.update.mockResolvedValue({
      countryCode: 'FR',
      category: 'visa',
    } as any);

    await controller.update('fr', 'visa', dto, req);

    expect(service.update).toHaveBeenCalledWith('fr', 'visa', dto);
    expect(adminLog.log).toHaveBeenCalledWith(
      1,
      'UPDATE',
      'SearchHint',
      'FR/visa',
      expect.stringContaining('FR/visa'),
    );
  });

  it('remove deletes and logs the admin action', async () => {
    const result = await controller.remove('fr', 'visa', req);

    expect(service.remove).toHaveBeenCalledWith('fr', 'visa');
    expect(adminLog.log).toHaveBeenCalledWith(
      1,
      'DELETE',
      'SearchHint',
      'FR/visa',
      expect.stringContaining('FR/visa'),
    );
    expect(result).toEqual({ deleted: true });
  });

  it('seed runs the seeding and logs a summary of the result', async () => {
    service.seedMissing.mockResolvedValue({
      inserted: 3,
      skipped: 5,
      total: 8,
    });

    const result = await controller.seed(req);

    expect(adminLog.log).toHaveBeenCalledWith(
      1,
      'SEED',
      'SearchHint',
      'all',
      expect.stringContaining('3'),
    );
    expect(result).toEqual({ inserted: 3, skipped: 5, total: 8 });
  });
});
