import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistController } from './checklist.controller';
import { ChecklistService } from './checklist.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ChecklistController', () => {
  let controller: ChecklistController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChecklistController],
      providers: [
        {
          provide: ChecklistService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ChecklistController>(ChecklistController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should delegate to service.create()', () => {
      const dto = { name: 'Visa' } as any;
      controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll()', () => {
    it('should delegate to service.findAll()', () => {
      controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should delegate to service.findOne() with a numeric id', () => {
      controller.findOne('5');
      expect(service.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe('update()', () => {
    it('should delegate to service.update()', () => {
      const dto = { name: 'Updated' } as any;
      controller.update('5', dto);
      expect(service.update).toHaveBeenCalledWith(5, dto);
    });
  });

  describe('remove()', () => {
    it('should delegate to service.remove()', () => {
      controller.remove('5');
      expect(service.remove).toHaveBeenCalledWith(5);
    });
  });
});
