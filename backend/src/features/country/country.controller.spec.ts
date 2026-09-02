import { Test, TestingModule } from '@nestjs/testing';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { AdminLogService } from '../admin-log/admin-log.service';

// Controllers now take @Request() req (admin-log audit); a minimal mock user suffices.
const mockReq = { user: { userId: 1 } } as any;

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  getAvailableCountries: jest.fn(),
});

describe('CountryController', () => {
  let controller: CountryController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountryController],
      providers: [
        { provide: CountryService, useValue: service },
        { provide: AdminLogService, useValue: { log: jest.fn() } },
      ],
    }).compile();
    controller = module.get<CountryController>(CountryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a country', async () => {
      service.create.mockResolvedValue({ idCountry: 1, countryName: 'France' });
      const result = await controller.create(
        { countryName: 'France' } as any,
        mockReq,
      );
      expect(result.countryName).toBe('France');
    });
  });

  describe('findAll()', () => {
    it('should return all countries when no status filter', async () => {
      service.findAll.mockResolvedValue([{ idCountry: 1 }]);
      const result = await controller.findAll();
      expect(result).toHaveLength(1);
      expect(service.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should pass status query param to service', async () => {
      service.findAll.mockResolvedValue([{ idCountry: 2, status: 'active' }]);
      const result = await controller.findAll('active');
      expect(result).toHaveLength(1);
      expect(service.findAll).toHaveBeenCalledWith('active');
    });
  });

  describe('getAvailable()', () => {
    it('should delegate to service.getAvailableCountries()', async () => {
      service.getAvailableCountries.mockResolvedValue([
        { code: 'FR', name: 'France' },
      ]);
      const result = await controller.getAvailable();
      expect(service.getAvailableCountries).toHaveBeenCalled();
      expect(result).toEqual([{ code: 'FR', name: 'France' }]);
    });
  });

  describe('findOne()', () => {
    it('should delegate with parsed id', async () => {
      service.findOne.mockResolvedValue({ idCountry: 5 });
      const result = await controller.findOne('5');
      expect(service.findOne).toHaveBeenCalledWith(5);
      expect(result.idCountry).toBe(5);
    });
  });

  describe('update()', () => {
    it('should update a country', async () => {
      service.update.mockResolvedValue({
        idCountry: 1,
        countryName: 'Updated',
      });
      const result = await controller.update(
        '1',
        {
          countryName: 'Updated',
        } as any,
        mockReq,
      );
      expect(result.countryName).toBe('Updated');
    });
  });

  describe('remove()', () => {
    it('should remove a country', async () => {
      service.findOne.mockResolvedValue({ idCountry: 3, countryName: 'X' });
      service.remove.mockResolvedValue(undefined);
      await controller.remove('3', mockReq);
      expect(service.remove).toHaveBeenCalledWith(3);
    });
  });
});
