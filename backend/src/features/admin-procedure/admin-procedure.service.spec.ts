import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminProcedureService } from './admin-procedure.service';
import { AdminProcedure } from './entities/admin-procedure.entity';

describe('AdminProcedureService', () => {
  let service: AdminProcedureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminProcedureService,
        {
          provide: getRepositoryToken(AdminProcedure),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AdminProcedureService>(AdminProcedureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
