import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserReportService } from './user-report.service';
import { UserReport } from './entities/user-report.entity';
import { User } from '../user/entities/user.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
});

describe('UserReportService', () => {
  let service: UserReportService;
  let reportRepo: any;
  let userRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserReportService,
        { provide: getRepositoryToken(UserReport), useFactory: mockRepo },
        { provide: getRepositoryToken(User), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<UserReportService>(UserReportService);
    reportRepo = module.get(getRepositoryToken(UserReport));
    userRepo = module.get(getRepositoryToken(User));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('throws BadRequestException when reporting yourself', async () => {
      await expect(
        service.create(1, { reportedUserId: 1, reason: 'x' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws NotFoundException when the reported user does not exist', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.create(1, { reportedUserId: 2, reason: 'x' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when a pending report already exists', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 2 });
      reportRepo.findOne.mockResolvedValue({ idUserReport: 5 });
      await expect(
        service.create(1, { reportedUserId: 2, reason: 'x' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('creates a report for a valid new signalement', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 2 });
      reportRepo.findOne.mockResolvedValue(null);
      reportRepo.create.mockImplementation((r: any) => r);
      reportRepo.save.mockImplementation((r: any) => Promise.resolve(r));

      const result = await service.create(1, {
        reportedUserId: 2,
        reason: 'spam',
      } as any);

      expect(result.reason).toBe('spam');
      expect(reportRepo.save).toHaveBeenCalled();
    });

    it('defaults details to null when not provided', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 2 });
      reportRepo.findOne.mockResolvedValue(null);
      reportRepo.create.mockImplementation((r: any) => r);
      reportRepo.save.mockImplementation((r: any) => Promise.resolve(r));

      const result = await service.create(1, {
        reportedUserId: 2,
        reason: 'spam',
      } as any);

      expect(result.details).toBeNull();
    });
  });

  describe('findAll', () => {
    it('filters by status when provided', async () => {
      reportRepo.find.mockResolvedValue([]);
      await service.findAll('pending');
      expect(reportRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: { status: 'pending' } }),
      );
    });

    it('returns all reports when no status is provided', async () => {
      reportRepo.find.mockResolvedValue([]);
      await service.findAll();
      expect(reportRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });
  });

  describe('resolve', () => {
    it('throws NotFoundException when the report does not exist', async () => {
      reportRepo.findOne.mockResolvedValue(null);
      await expect(service.resolve(999, 1, 'resolved')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('marks the report resolved with moderator info', async () => {
      const report: any = { idUserReport: 1, status: 'pending' };
      reportRepo.findOne.mockResolvedValue(report);
      reportRepo.save.mockImplementation((r: any) => Promise.resolve(r));

      const result = await service.resolve(1, 42, 'resolved', 'ok');

      expect(result.status).toBe('resolved');
      expect(result.moderatorNote).toBe('ok');
      expect(result.moderator).toEqual({ idUser: 42 });
      expect(result.resolvedAt).toBeInstanceOf(Date);
    });

    it('defaults moderatorNote to null when not provided', async () => {
      const report: any = { idUserReport: 1, status: 'pending' };
      reportRepo.findOne.mockResolvedValue(report);
      reportRepo.save.mockImplementation((r: any) => Promise.resolve(r));

      const result = await service.resolve(1, 42, 'rejected');

      expect(result.moderatorNote).toBeNull();
    });
  });

  describe('stats', () => {
    it('aggregates counts by status', async () => {
      reportRepo.count
        .mockResolvedValueOnce(2) // pending
        .mockResolvedValueOnce(3) // resolved
        .mockResolvedValueOnce(1); // rejected

      const result = await service.stats();

      expect(result).toEqual({
        pending: 2,
        resolved: 3,
        rejected: 1,
        total: 6,
      });
    });
  });
});
