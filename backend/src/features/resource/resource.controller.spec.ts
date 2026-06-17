import { Test, TestingModule } from '@nestjs/testing';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';
import { AdminLogService } from '../admin-log/admin-log.service';

describe('ResourceController', () => {
  let controller: ResourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourceController],
      providers: [
        {
          provide: ResourceService,
          useValue: {},
        },
        {
          provide: AdminLogService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ResourceController>(ResourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
