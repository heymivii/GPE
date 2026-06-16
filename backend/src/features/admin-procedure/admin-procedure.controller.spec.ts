import { Test, TestingModule } from '@nestjs/testing';
import { AdminProcedureController } from './admin-procedure.controller';
import { AdminProcedureService } from './admin-procedure.service';

describe('AdminProcedureController', () => {
  let controller: AdminProcedureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminProcedureController],
      providers: [
        {
          provide: AdminProcedureService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AdminProcedureController>(AdminProcedureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
