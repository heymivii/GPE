import { Test, TestingModule } from '@nestjs/testing';
import { ExperienceController } from './experience.controller';
import { ExperienceService } from './experience.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ExperienceController', () => {
  let controller: ExperienceController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExperienceController],
      providers: [
        {
          provide: ExperienceService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ExperienceController>(ExperienceController);
  });

  const req = { user: { userId: 7 } } as any;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should delegate to service.create() with the user id', () => {
      const dto = { title: 'Expat' } as any;
      controller.create(req, dto);
      expect(service.create).toHaveBeenCalledWith(7, dto);
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
