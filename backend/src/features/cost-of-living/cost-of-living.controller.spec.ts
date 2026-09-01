import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CostOfLivingController } from './cost-of-living.controller';
import { CostOfLivingService } from './cost-of-living.service';
import { AdminLogService } from '../admin-log/admin-log.service';
import { City } from '../city/entities/city.entity';

describe('CostOfLivingController', () => {
  let controller: CostOfLivingController;
  let service: {
    getCostOfLiving: jest.Mock;
    seedAllCities: jest.Mock;
    updateCostOfLiving: jest.Mock;
    fetchAndStoreCuratedCity: jest.Mock;
  };
  let adminLog: { log: jest.Mock };
  let cityRepository: { findOne: jest.Mock };

  beforeEach(async () => {
    service = {
      getCostOfLiving: jest.fn(),
      seedAllCities: jest.fn(),
      updateCostOfLiving: jest.fn(),
      fetchAndStoreCuratedCity: jest.fn(),
    };
    adminLog = { log: jest.fn() };
    cityRepository = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CostOfLivingController],
      providers: [
        {
          provide: CostOfLivingService,
          useValue: service,
        },
        {
          provide: AdminLogService,
          useValue: adminLog,
        },
        {
          provide: getRepositoryToken(City),
          useValue: cityRepository,
        },
      ],
    }).compile();

    controller = module.get<CostOfLivingController>(CostOfLivingController);
  });

  const req = { user: { userId: 7 } } as any;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCostOfLiving()', () => {
    it('should delegate to service.getCostOfLiving() with city and country', async () => {
      service.getCostOfLiving.mockResolvedValue({ city: 'Paris' });

      const result = await controller.getCostOfLiving('Paris', 'France');

      expect(service.getCostOfLiving).toHaveBeenCalledWith('Paris', 'France');
      expect(result).toEqual({ city: 'Paris' });
    });
  });

  describe('seedCache()', () => {
    it('should delegate to service.seedAllCities()', async () => {
      service.seedAllCities.mockResolvedValue({ seeded: 3 });

      const result = await controller.seedCache();

      expect(service.seedAllCities).toHaveBeenCalled();
      expect(result).toEqual({ seeded: 3 });
    });
  });

  describe('updateCostOfLiving()', () => {
    it('should update and log with the found city name', async () => {
      cityRepository.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
      service.updateCostOfLiving.mockResolvedValue({ idCity: 1, rent: 1200 });

      const result = await controller.updateCostOfLiving(
        '1',
        { rent: 1200 },
        req,
      );

      expect(cityRepository.findOne).toHaveBeenCalledWith({
        where: { idCity: 1 },
      });
      expect(service.updateCostOfLiving).toHaveBeenCalledWith(1, {
        rent: 1200,
      });
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'UPDATE',
        'CostOfLiving',
        '1',
        expect.stringContaining('Paris'),
      );
      expect(result).toEqual({ idCity: 1, rent: 1200 });
    });

    it('should fall back to the raw id in the log message when the city is not found', async () => {
      cityRepository.findOne.mockResolvedValue(null);
      service.updateCostOfLiving.mockResolvedValue({ idCity: 99 });

      await controller.updateCostOfLiving('99', { rent: 900 }, req);

      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'UPDATE',
        'CostOfLiving',
        '99',
        expect.stringContaining('ID 99'),
      );
    });
  });

  describe('adminFetch()', () => {
    it('should delegate to service.fetchAndStoreCuratedCity() with the dto', async () => {
      const dto = { citySlug: 'paris-fr' } as any;
      service.fetchAndStoreCuratedCity.mockResolvedValue({ ok: true });

      const result = await controller.adminFetch(dto);

      expect(service.fetchAndStoreCuratedCity).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ ok: true });
    });
  });
});
