import { Test, TestingModule } from '@nestjs/testing';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('CountryController', () => {
  let controller: CountryController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountryController],
      providers: [{ provide: CountryService, useValue: service }],
    }).compile();
    controller = module.get<CountryController>(CountryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a country', async () => {
      service.create.mockResolvedValue({ id: 1, name: 'France' });
      const result = await controller.create({ name: 'France' } as any);
      expect(result.name).toBe('France');
    });
  });

  describe('findAll()', () => {
    it('should return all countries', async () => {
      service.findAll.mockResolvedValue([{ id: 1 }]);
      const result = await controller.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne()', () => {
    it('should delegate with parsed id', async () => {
      service.findOne.mockResolvedValue({ id: 5 });
      const result = await controller.findOne('5');
      expect(service.findOne).toHaveBeenCalledWith(5);
      expect(result.id).toBe(5);
    });
  });

  describe('update()', () => {
    it('should update a country', async () => {
      service.update.mockResolvedValue({
        id: 1,
        name: 'Updated',
      });
      const result = await controller.update('1', {
        name: 'Updated',
      } as any);
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove()', () => {
    it('should remove a country', async () => {
      service.remove.mockResolvedValue(undefined);
      await controller.remove('3');
      expect(service.remove).toHaveBeenCalledWith(3);
    });
  });
});
