import { Test, TestingModule } from '@nestjs/testing';
import { CoutVieService } from './cout-vie.service';

describe('CoutVieService', () => {
  let service: CoutVieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoutVieService],
    }).compile();

    service = module.get<CoutVieService>(CoutVieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
