import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { AdminProcedureService } from './admin-procedure.service';
import { AdminProcedure } from './entities/admin-procedure.entity';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('AdminProcedureService', () => {
  let service: AdminProcedureService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    repo = mockRepo();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminProcedureService,
        {
          provide: getRepositoryToken(AdminProcedure),
          useValue: repo,
        },
      ],
    }).compile();

    service = module.get<AdminProcedureService>(AdminProcedureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create()', () => {
    it('should build the entity with a nested country and save it', async () => {
      const dto = {
        procedureType: 'visa',
        category: 'admin',
        stepOrder: 1,
        description: 'Desc',
        averageDelayDays: 30,
        countryId: 5,
      } as any;
      repo.create.mockReturnValue({ ...dto });
      repo.save.mockResolvedValue({ idAdminProcedure: 1, ...dto });

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          procedureType: 'visa',
          country: { idCountry: 5 },
        }),
      );
      expect(repo.save).toHaveBeenCalled();
      expect(result.idAdminProcedure).toBe(1);
    });
  });

  describe('findAll()', () => {
    it('should delegate to repo.find() with the country relation', async () => {
      repo.find.mockResolvedValue([{ idAdminProcedure: 1 }]);
      const result = await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({ relations: ['country'] });
      expect(result).toEqual([{ idAdminProcedure: 1 }]);
    });
  });

  describe('findByCountry()', () => {
    it('should filter by country id', async () => {
      repo.find.mockResolvedValue([{ idAdminProcedure: 1 }]);
      const result = await service.findByCountry(5);
      expect(repo.find).toHaveBeenCalledWith({
        where: { country: { idCountry: 5 } },
        relations: ['country'],
      });
      expect(result).toEqual([{ idAdminProcedure: 1 }]);
    });
  });

  describe('findOne()', () => {
    it('should return the procedure when found', async () => {
      repo.findOne.mockResolvedValue({ idAdminProcedure: 1 });
      const result = await service.findOne(1);
      expect(result).toEqual({ idAdminProcedure: 1 });
    });

    it('should throw NotFoundException when missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update()', () => {
    it('should merge the dto onto the found entity and save it', async () => {
      repo.findOne.mockResolvedValue({
        idAdminProcedure: 1,
        description: 'Old',
      });
      repo.save.mockImplementation(async (e) => e);

      const result = await service.update(1, { description: 'New' } as any);

      expect(result.description).toBe('New');
      expect(repo.save).toHaveBeenCalled();
    });

    it('should propagate NotFoundException when the procedure does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(
        service.update(999, { description: 'New' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove()', () => {
    it('should find then remove the procedure', async () => {
      const procedure = { idAdminProcedure: 1 };
      repo.findOne.mockResolvedValue(procedure);
      repo.remove.mockResolvedValue(procedure);

      await service.remove(1);

      expect(repo.remove).toHaveBeenCalledWith(procedure);
    });

    it('should propagate NotFoundException when the procedure does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
