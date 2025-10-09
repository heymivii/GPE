import { Test, TestingModule } from '@nestjs/testing';
import { IndustrySectorService } from './industry-sector.service';

describe('IndustrySectorService', () => {
  let service: IndustrySectorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IndustrySectorService],
    }).compile();

    service = module.get<IndustrySectorService>(IndustrySectorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
