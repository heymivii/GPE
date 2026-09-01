import { Test, TestingModule } from '@nestjs/testing';
import { GuideController } from './guide.controller';
import { GuideService } from './guide.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('GuideController', () => {
  let controller: GuideController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GuideController],
      providers: [
        {
          provide: GuideService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<GuideController>(GuideController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should delegate to service.create()', () => {
      const dto = { title: 'Guide' } as any;
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
      const dto = { title: 'Updated' } as any;
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
