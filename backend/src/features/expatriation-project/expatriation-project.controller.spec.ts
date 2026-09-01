import { Test, TestingModule } from '@nestjs/testing';
import { ExpatriationProjectController } from './expatriation-project.controller';
import { ExpatriationProjectService } from './expatriation-project.service';

describe('ExpatriationProjectController', () => {
  let controller: ExpatriationProjectController;
  let service: jest.Mocked<ExpatriationProjectService>;

  const req = { user: { userId: 1 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpatriationProjectController],
      providers: [
        {
          provide: ExpatriationProjectService,
          useValue: {
            create: jest.fn(),
            findAllByUser: jest.fn(),
            countByUser: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            unlock: jest.fn(),
            remove: jest.fn(),
            findAll: jest.fn(),
            adminUpdate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ExpatriationProjectController>(
      ExpatriationProjectController,
    );
    service = module.get(ExpatriationProjectService);
  });

  it('create uses the authenticated user id', async () => {
    const dto = { idDestinationCountry: 1 } as any;
    await controller.create(req, dto);
    expect(service.create).toHaveBeenCalledWith(1, dto);
  });

  it('findAll scopes to the authenticated user', async () => {
    await controller.findAll(req);
    expect(service.findAllByUser).toHaveBeenCalledWith(1);
  });

  it('getCount wraps the count in an object', async () => {
    service.countByUser.mockResolvedValue(3);
    const result = await controller.getCount(req);
    expect(result).toEqual({ count: 3 });
  });

  it('findOne converts the id and scopes to the user', async () => {
    await controller.findOne(req, '5');
    expect(service.findOne).toHaveBeenCalledWith(5, 1);
  });

  it('update converts the id and scopes to the user', async () => {
    const dto = { objective: 'x' } as any;
    await controller.update(req, '5', dto);
    expect(service.update).toHaveBeenCalledWith(5, 1, dto);
  });

  it('unlock converts the id and scopes to the user', async () => {
    await controller.unlock(req, '5');
    expect(service.unlock).toHaveBeenCalledWith(5, 1);
  });

  it('remove converts the id and scopes to the user', async () => {
    await controller.remove(req, '5');
    expect(service.remove).toHaveBeenCalledWith(5, 1);
  });

  it('adminFindAll returns every project unscoped', async () => {
    await controller.adminFindAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('adminUpdate converts the id and does not scope to a user', async () => {
    const dto = { status: 'validated' } as any;
    await controller.adminUpdate('5', dto);
    expect(service.adminUpdate).toHaveBeenCalledWith(5, dto);
  });
});
