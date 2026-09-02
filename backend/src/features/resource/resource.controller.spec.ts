import { Test, TestingModule } from '@nestjs/testing';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';
import { AdminLogService } from '../admin-log/admin-log.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByCountry: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('ResourceController', () => {
  let controller: ResourceController;
  let service: ReturnType<typeof mockService>;
  let adminLog: { log: jest.Mock };

  const req = { user: { userId: 7 } } as any;

  beforeEach(async () => {
    service = mockService();
    adminLog = { log: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourceController],
      providers: [
        {
          provide: ResourceService,
          useValue: service,
        },
        {
          provide: AdminLogService,
          useValue: adminLog,
        },
      ],
    }).compile();

    controller = module.get<ResourceController>(ResourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should create the resource and log the action', async () => {
      service.create.mockResolvedValue({ idResource: 1, title: 'Guide visa' });

      const result = await controller.create(
        { title: 'Guide visa' } as any,
        req,
      );

      expect(service.create).toHaveBeenCalledWith({ title: 'Guide visa' });
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'CREATE',
        'Resource',
        '1',
        expect.stringContaining('Guide visa'),
      );
      expect(result).toEqual({ idResource: 1, title: 'Guide visa' });
    });
  });

  describe('findAll()', () => {
    it('should call service.findAll() when no countryId', () => {
      controller.findAll(undefined);
      expect(service.findAll).toHaveBeenCalled();
      expect(service.findByCountry).not.toHaveBeenCalled();
    });

    it('should call service.findByCountry() with a numeric id when provided', () => {
      controller.findAll('5');
      expect(service.findByCountry).toHaveBeenCalledWith(5);
      expect(service.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findOne()', () => {
    it('should delegate to service.findOne() with a numeric id', () => {
      controller.findOne('1');
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update()', () => {
    it('should update the resource and log the action', async () => {
      service.update.mockResolvedValue({ idResource: 1, title: 'Guide visa v2' });

      const result = await controller.update(
        '1',
        { title: 'Guide visa v2' } as any,
        req,
      );

      expect(service.update).toHaveBeenCalledWith(1, {
        title: 'Guide visa v2',
      });
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'UPDATE',
        'Resource',
        '1',
        expect.stringContaining('Guide visa v2'),
      );
      expect(result).toEqual({ idResource: 1, title: 'Guide visa v2' });
    });
  });

  describe('remove()', () => {
    it('should look up the resource, remove it, and log the action', async () => {
      service.findOne.mockResolvedValue({ idResource: 1, title: 'Guide visa' });
      service.remove.mockResolvedValue(undefined);

      await controller.remove('1', req);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'DELETE',
        'Resource',
        '1',
        expect.stringContaining('Guide visa'),
      );
    });
  });
});
