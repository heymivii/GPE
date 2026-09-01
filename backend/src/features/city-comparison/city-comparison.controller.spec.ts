import { Test, TestingModule } from '@nestjs/testing';
import { CityComparisonController } from './city-comparison.controller';
import { CityComparisonService } from './city-comparison.service';

const mockService = () => ({
  create: jest.fn(),
  findAllByUser: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('CityComparisonController', () => {
  let controller: CityComparisonController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CityComparisonController],
      providers: [
        {
          provide: CityComparisonService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<CityComparisonController>(CityComparisonController);
  });

  const req = { user: { userId: 7 } } as any;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should delegate to service.create() with the user id', () => {
      const dto = { cityIds: [1, 2] } as any;
      controller.create(req, dto);
      expect(service.create).toHaveBeenCalledWith(7, dto);
    });
  });

  describe('findAll()', () => {
    it('should delegate to service.findAllByUser() with the user id', () => {
      controller.findAll(req);
      expect(service.findAllByUser).toHaveBeenCalledWith(7);
    });
  });

  describe('findOne()', () => {
    it('should delegate to service.findOne() with numeric id and user id', () => {
      controller.findOne(req, '5');
      expect(service.findOne).toHaveBeenCalledWith(5, 7);
    });
  });

  describe('remove()', () => {
    it('should delegate to service.remove() with numeric id and user id', () => {
      controller.remove(req, '5');
      expect(service.remove).toHaveBeenCalledWith(5, 7);
    });
  });
});
