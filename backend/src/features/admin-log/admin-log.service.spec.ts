import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminLogService } from './admin-log.service';
import { AdminLog } from './entities/admin-log.entity';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
});

describe('AdminLogService', () => {
  let service: AdminLogService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminLogService,
        { provide: getRepositoryToken(AdminLog), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<AdminLogService>(AdminLogService);
    repo = module.get(getRepositoryToken(AdminLog));
    jest.clearAllMocks();
  });

  describe('log', () => {
    it('creates and saves a log entry with the given fields', async () => {
      const entry = {
        userId: 1,
        action: 'delete',
        entityType: 'project',
        entityId: '5',
        details: 'cascade',
      };
      repo.create.mockReturnValue(entry);
      repo.save.mockResolvedValue(entry);

      const result = await service.log(1, 'delete', 'project', '5', 'cascade');

      expect(repo.create).toHaveBeenCalledWith(entry);
      expect(repo.save).toHaveBeenCalledWith(entry);
      expect(result).toEqual(entry);
    });

    it('works without optional details', async () => {
      const entry = {
        userId: 1,
        action: 'create',
        entityType: 'user',
        entityId: '2',
        details: undefined,
      };
      repo.create.mockReturnValue(entry);
      repo.save.mockResolvedValue(entry);

      await service.log(1, 'create', 'user', '2');

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ details: undefined }),
      );
    });
  });

  describe('findAll', () => {
    it('returns logs ordered by id desc, with the user relation loaded', async () => {
      repo.find.mockResolvedValue([{ idAdminLog: 1 }]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(repo.find).toHaveBeenCalledWith({
        relations: ['user'],
        order: { idAdminLog: 'DESC' },
      });
    });
  });
});
