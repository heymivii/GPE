import { Test, TestingModule } from '@nestjs/testing';
import { ContinentController } from './continent.controller';
import { ContinentService } from './continent.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ContinentController', () => {
  let controller: ContinentController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContinentController],
      providers: [{ provide: ContinentService, useValue: service }],
    }).compile();
    controller = module.get<ContinentController>(ContinentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create a continent', async () => {
      service.create.mockResolvedValue({
        id: 1,
        name: 'Europe',
      });
      const result = await controller.create({
        name: 'Europe',
      } as any);
      expect(result.name).toBe('Europe');
    });
  });

  describe('findAll()', () => {
    it('should return all continents', async () => {
      service.findAll.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);
      const result = await controller.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne()', () => {
    it('should parse id and delegate', async () => {
      service.findOne.mockResolvedValue({ id: 3 });
      const result = await controller.findOne('3');
      expect(service.findOne).toHaveBeenCalledWith(3);
      expect(result.id).toBe(3);
    });
  });

  describe('update()', () => {
    it('should update a continent', async () => {
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
    it('should remove a continent', async () => {
      service.remove.mockResolvedValue(undefined);
      await controller.remove('2');
      expect(service.remove).toHaveBeenCalledWith(2);
    });
  });
});
