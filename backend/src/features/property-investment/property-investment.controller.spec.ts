import { Test, TestingModule } from '@nestjs/testing';
import { PropertyInvestmentController } from './property-investment.controller';
import { PropertyInvestmentService } from './property-investment.service';
import { AdminLogService } from '../admin-log/admin-log.service';

describe('PropertyInvestmentController', () => {
  let controller: PropertyInvestmentController;
  let service: jest.Mocked<PropertyInvestmentService>;
  let adminLog: jest.Mocked<AdminLogService>;

  const req = { user: { userId: 1 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropertyInvestmentController],
      providers: [
        {
          provide: PropertyInvestmentService,
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

    controller = module.get<PropertyInvestmentController>(
      PropertyInvestmentController,
    );
    service = module.get(PropertyInvestmentService);
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
    const dto = { averagePricePerSqm: 5000 } as any;
    service.updateCity.mockResolvedValue({ city: 'Paris' } as any);

    const result = await controller.updateCity('5', dto, req);

    expect(service.updateCity).toHaveBeenCalledWith(5, dto);
    expect(adminLog.log).toHaveBeenCalledWith(
      1,
      'UPDATE',
      'PropertyInvestment',
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
      'PropertyInvestment',
      '5',
      expect.stringContaining('Paris'),
    );
    expect(result).toEqual({ city: 'Paris' });
  });
});
