import { Test, TestingModule } from '@nestjs/testing';
import { AdminLogController } from './admin-log.controller';
import { AdminLogService } from './admin-log.service';

describe('AdminLogController', () => {
  let controller: AdminLogController;
  let service: jest.Mocked<AdminLogService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminLogController],
      providers: [
        {
          provide: AdminLogService,
          useValue: { findAll: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AdminLogController>(AdminLogController);
    service = module.get(AdminLogService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('strips the password from the joined user before returning', async () => {
    service.findAll.mockResolvedValue([
      {
        idAdminLog: 1,
        user: { idUser: 1, email: 'a@a.com', password: 'secret' },
      },
    ] as any);

    const result = await controller.findAll();

    expect(result[0].user).not.toHaveProperty('password');
    expect(result[0].user).toEqual({ idUser: 1, email: 'a@a.com' });
  });

  it('leaves logs without a user relation untouched', async () => {
    service.findAll.mockResolvedValue([{ idAdminLog: 2, user: null }] as any);

    const result = await controller.findAll();

    expect(result[0].user).toBeNull();
  });
});
