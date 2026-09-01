import { Test, TestingModule } from '@nestjs/testing';
import { AdminProcedureController } from './admin-procedure.controller';
import { AdminProcedureService } from './admin-procedure.service';
import { AdminProcedureGeneratorService } from './admin-procedure-generator.service';
import { AdminLogService } from '../admin-log/admin-log.service';

const mockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findByCountry: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

const mockGeneratorService = () => ({
  generateFromGovLinks: jest.fn(),
});

describe('AdminProcedureController', () => {
  let controller: AdminProcedureController;
  let service: ReturnType<typeof mockService>;
  let generator: ReturnType<typeof mockGeneratorService>;
  let adminLog: { log: jest.Mock };

  const req = { user: { userId: 7 } } as any;

  beforeEach(async () => {
    service = mockService();
    generator = mockGeneratorService();
    adminLog = { log: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminProcedureController],
      providers: [
        {
          provide: AdminProcedureService,
          useValue: service,
        },
        {
          provide: AdminProcedureGeneratorService,
          useValue: generator,
        },
        {
          provide: AdminLogService,
          useValue: adminLog,
        },
      ],
    }).compile();

    controller =
      module.get<AdminProcedureController>(AdminProcedureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generateFromGovLinks()', () => {
    it('should generate procedures for a country and log the count', async () => {
      generator.generateFromGovLinks.mockResolvedValue([{}, {}, {}]);

      const result = await controller.generateFromGovLinks('France', req);

      expect(generator.generateFromGovLinks).toHaveBeenCalledWith('France');
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'GENERATE',
        'AdminProcedure',
        'France',
        expect.stringContaining('3'),
      );
      expect(result).toEqual([{}, {}, {}]);
    });
  });

  describe('create()', () => {
    it('should create the procedure and log the action', async () => {
      service.create.mockResolvedValue({
        idAdminProcedure: 1,
        procedureType: 'Visa',
      });

      const result = await controller.create(
        { procedureType: 'Visa' } as any,
        req,
      );

      expect(service.create).toHaveBeenCalledWith({ procedureType: 'Visa' });
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'CREATE',
        'AdminProcedure',
        '1',
        expect.stringContaining('Visa'),
      );
      expect(result).toEqual({ idAdminProcedure: 1, procedureType: 'Visa' });
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
    it('should update the procedure and log the action', async () => {
      service.update.mockResolvedValue({
        idAdminProcedure: 1,
        procedureType: 'Visa v2',
      });

      const result = await controller.update(
        '1',
        { procedureType: 'Visa v2' } as any,
        req,
      );

      expect(service.update).toHaveBeenCalledWith(1, {
        procedureType: 'Visa v2',
      });
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'UPDATE',
        'AdminProcedure',
        '1',
        expect.stringContaining('Visa v2'),
      );
      expect(result).toEqual({
        idAdminProcedure: 1,
        procedureType: 'Visa v2',
      });
    });
  });

  describe('remove()', () => {
    it('should look up the procedure, remove it, and log the action', async () => {
      service.findOne.mockResolvedValue({
        idAdminProcedure: 1,
        procedureType: 'Visa',
      });
      service.remove.mockResolvedValue(undefined);

      await controller.remove('1', req);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(adminLog.log).toHaveBeenCalledWith(
        7,
        'DELETE',
        'AdminProcedure',
        '1',
        expect.stringContaining('Visa'),
      );
    });
  });
});
