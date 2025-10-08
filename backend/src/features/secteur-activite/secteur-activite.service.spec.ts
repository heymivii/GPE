import { Test, TestingModule } from '@nestjs/testing';
import { SecteurActiviteService } from './secteur-activite.service';

describe('SecteurActiviteService', () => {
  let service: SecteurActiviteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecteurActiviteService],
    }).compile();

    service = module.get<SecteurActiviteService>(SecteurActiviteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
