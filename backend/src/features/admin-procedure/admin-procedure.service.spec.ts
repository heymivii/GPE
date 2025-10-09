import { Test, TestingModule } from '@nestjs/testing';
import { AdminProcedureService } from './admin-procedure.service';

describe('AdminProcedureService', () => {
  let service: AdminProcedureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminProcedureService],
    }).compile();

    service = module.get<AdminProcedureService>(AdminProcedureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
