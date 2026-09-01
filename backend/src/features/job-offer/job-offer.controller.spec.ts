import { Test, TestingModule } from '@nestjs/testing';
import { JobOfferController } from './job-offer.controller';
import { JobOfferService } from './job-offer.service';
import { AdzunaService } from './adzuna.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockAdzuna = () => ({
  searchJobs: jest.fn(),
});

describe('JobOfferController', () => {
  let controller: JobOfferController;
  let service: ReturnType<typeof mockService>;
  let adzuna: ReturnType<typeof mockAdzuna>;

  beforeEach(async () => {
    service = mockService();
    adzuna = mockAdzuna();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOfferController],
      providers: [
        {
          provide: JobOfferService,
          useValue: service,
        },
        {
          provide: AdzunaService,
          useValue: adzuna,
        },
      ],
    }).compile();

    controller = module.get<JobOfferController>(JobOfferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should delegate to service.create()', () => {
      const dto = { title: 'Dev' } as any;
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

  describe('searchJobs()', () => {
    it('should delegate to adzunaService.searchJobs()', async () => {
      const dto = { what: 'dev', where: 'Paris' } as any;
      adzuna.searchJobs.mockResolvedValue([{ id: 1 }]);
      const result = await controller.searchJobs(dto);
      expect(adzuna.searchJobs).toHaveBeenCalledWith(dto);
      expect(result).toEqual([{ id: 1 }]);
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
