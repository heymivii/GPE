import { Test, TestingModule } from '@nestjs/testing';
import { QualityOfLifeController } from './quality-of-life.controller';
import { QualityOfLifeService } from './quality-of-life.service';
import { AdminLogService } from '../admin-log/admin-log.service';

describe('QualityOfLifeController', () => {
  let controller: QualityOfLifeController;
  let service: jest.Mocked<QualityOfLifeService>;
  let adminLog: jest.Mocked<AdminLogService>;

  const req = { user: { userId: 1 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QualityOfLifeController],
      providers: [
        {
          provide: QualityOfLifeService,
          useValue: {
            getByCountry: jest.fn(),
            getCachedCity: jest.fn(),
            updateCity: jest.fn(),
            getByCity: jest.fn(),
          },
        },
        { provide: AdminLogService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    controller = module.get<QualityOfLifeController>(QualityOfLifeController);
    service = module.get(QualityOfLifeService);
    adminLog = module.get(AdminLogService);
  });

  it('get delegates to getByCountry', async () => {
    await controller.get('FR');
    expect(service.getByCountry).toHaveBeenCalledWith('FR');
  });

  it('getCity converts the id and reads from cache only', async () => {
    await controller.getCity('5');
    expect(service.getCachedCity).toHaveBeenCalledWith(5);
  });

  it('updateCity persists the edit and logs the admin action', async () => {
    const dto = { safetyIndex: 70 } as any;
    service.updateCity.mockResolvedValue({ city: 'Paris' } as any);

    const result = await controller.updateCity('5', dto, req);

    expect(service.updateCity).toHaveBeenCalledWith(5, dto);
    expect(adminLog.log).toHaveBeenCalledWith(
      1,
      'UPDATE',
      'QualityOfLife',
      '5',
      expect.stringContaining('Paris'),
    );
    expect(result).toEqual({ city: 'Paris' });
  });

  it('adminFetchCity forces a refresh and logs the admin action', async () => {
    const dto = { cityId: 5, slug: 'paris' } as any;
    service.getByCity.mockResolvedValue({ city: 'Paris' } as any);

    const result = await controller.adminFetchCity(dto, req);

    expect(service.getByCity).toHaveBeenCalledWith(5, {
      refresh: true,
      slugOverride: 'paris',
    });
    expect(adminLog.log).toHaveBeenCalledWith(
      1,
      'UPDATE',
      'QualityOfLife',
      '5',
      expect.stringContaining('Paris'),
    );
    expect(result).toEqual({ city: 'Paris' });
  });
});
