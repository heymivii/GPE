import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { AdminLogService } from '../admin-log/admin-log.service';

const mockService = () => ({
  create: jest.fn(),
  markReviewDone: jest.fn(),
  reviewCity: jest.fn(),
  findAll: jest.fn(),
  findByCountry: jest.fn(),
  findOne: jest.fn(),
  getAvailableCities: jest.fn(),
  autofill: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('CityController', () => {
  let controller: CityController;
  let service: ReturnType<typeof mockService>;
  let adminLog: { log: jest.Mock };

  beforeEach(async () => {
    service = mockService();
    adminLog = { log: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityController],
      providers: [
        {
          provide: CityService,
          useValue: service,
        },
        {
          provide: AdminLogService,
          useValue: adminLog,
        },
      ],
    }).compile();

    controller = module.get<CityController>(CityController);
  });

  const req = { user: { userId: 7 } } as any;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('should call service.findAll() when no countryId', async () => {
      service.findAll.mockResolvedValue([{ idCity: 1 }]);
      const result = await controller.findAll(undefined, undefined);
      expect(service.findAll).toHaveBeenCalledWith(undefined);
      expect(result).toHaveLength(1);
    });

    it('should pass status to service.findAll() when no countryId', async () => {
      service.findAll.mockResolvedValue([{ idCity: 1, status: 'active' }]);
      await controller.findAll(undefined, 'active');
      expect(service.findAll).toHaveBeenCalledWith('active');
    });

    it('should call service.findByCountry() with countryId when provided', async () => {
      service.findByCountry.mockResolvedValue([{ idCity: 2, countryId: 5 }]);
      await controller.findAll('5', undefined);
      expect(service.findByCountry).toHaveBeenCalledWith(5, undefined);
    });

    it('should pass both countryId and status to service.findByCountry()', async () => {
      service.findByCountry.mockResolvedValue([
        { idCity: 2, countryId: 5, status: 'active' },
      ]);
      await controller.findAll('5', 'active');
      expect(service.findByCountry).toHaveBeenCalledWith(5, 'active');
    });
  });

  describe('create()', () => {
    it('should create the city and log the action', async () => {
      service.create.mockResolvedValue({ idCity: 1, name: 'Paris' });

      const result = await controller.create({ name: 'Paris' } as any, req);

      expect(service.create).toHaveBeenCalledWith({ name: 'Paris' }, 7);
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'CREATE',
        'City',
        '1',
        expect.stringContaining('Paris'),
      );
      expect(result).toEqual({ idCity: 1, name: 'Paris' });
    });
  });

  describe('reviewDone()', () => {
    it('should mark the review done and log the action', async () => {
      service.markReviewDone.mockResolvedValue({ idCity: 1, name: 'Paris' });

      const result = await controller.reviewDone('1', req);

      expect(service.markReviewDone).toHaveBeenCalledWith(1, 7);
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'UPDATE',
        'City',
        '1',
        expect.stringContaining('Paris'),
      );
      expect(result).toEqual({ idCity: 1, name: 'Paris' });
    });
  });

  describe('approve()', () => {
    it('should approve the city and log the action', async () => {
      service.reviewCity.mockResolvedValue({ idCity: 1, name: 'Paris' });

      const result = await controller.approve('1', req);

      expect(service.reviewCity).toHaveBeenCalledWith(1, 7, true);
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'APPROVE',
        'City',
        '1',
        expect.stringContaining('publiée'),
      );
      expect(result).toEqual({ idCity: 1, name: 'Paris' });
    });
  });

  describe('reject()', () => {
    it('should reject the city and log the action', async () => {
      service.reviewCity.mockResolvedValue({ idCity: 1, name: 'Paris' });

      const result = await controller.reject('1', req);

      expect(service.reviewCity).toHaveBeenCalledWith(1, 7, false);
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'REJECT',
        'City',
        '1',
        expect.stringContaining('non publiée'),
      );
      expect(result).toEqual({ idCity: 1, name: 'Paris' });
    });
  });

  describe('getAvailable()', () => {
    it('should default to an empty country string', () => {
      controller.getAvailable(undefined);
      expect(service.getAvailableCities).toHaveBeenCalledWith('');
    });

    it('should delegate to service.getAvailableCities()', () => {
      controller.getAvailable('France');
      expect(service.getAvailableCities).toHaveBeenCalledWith('France');
    });
  });

  describe('getAutofill()', () => {
    it('should throw BadRequestException when name is blank', () => {
      expect(() => controller.getAutofill('  ', 'France')).toThrow(
        BadRequestException,
      );
      expect(service.autofill).not.toHaveBeenCalled();
    });

    it('should trim name/country and pass undefined when country is blank', () => {
      controller.getAutofill(' Lyon ', '  ');
      expect(service.autofill).toHaveBeenCalledWith('Lyon', undefined);
    });

    it('should trim both name and country when provided', () => {
      controller.getAutofill(' Lyon ', ' France ');
      expect(service.autofill).toHaveBeenCalledWith('Lyon', 'France');
    });
  });

  describe('findOne()', () => {
    it('should delegate to service.findOne() with a numeric id', () => {
      service.findOne.mockResolvedValue({ idCity: 1 });
      controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update()', () => {
    it('should update the city and log the action', async () => {
      service.update.mockResolvedValue({ idCity: 1, name: 'Paris' });

      const result = await controller.update(
        '1',
        { name: 'Paris' } as any,
        req,
      );

      expect(service.update).toHaveBeenCalledWith(1, { name: 'Paris' });
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'UPDATE',
        'City',
        '1',
        expect.stringContaining('Paris'),
      );
      expect(result).toEqual({ idCity: 1, name: 'Paris' });
    });
  });

  describe('remove()', () => {
    it('should look up the city, remove it, and log the action', async () => {
      service.findOne.mockResolvedValue({ idCity: 1, name: 'Paris' });
      service.remove.mockResolvedValue(undefined);

      await controller.remove('1', req);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'DELETE',
        'City',
        '1',
        expect.stringContaining('Paris'),
      );
    });
  });
});
