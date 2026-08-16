import { Test, TestingModule } from '@nestjs/testing';
import { CityController } from './city.controller';
import { CityService } from './city.service';
import { AdminLogService } from '../admin-log/admin-log.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByCountry: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('CityController', () => {
  let controller: CityController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityController],
      providers: [
        {
          provide: CityService,
          useValue: service,
        },
        {
          provide: AdminLogService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<CityController>(CityController);
  });

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
});
