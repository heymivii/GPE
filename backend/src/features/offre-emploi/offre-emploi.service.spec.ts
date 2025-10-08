import { Test, TestingModule } from '@nestjs/testing';
import { OffreEmploiService } from './offre-emploi.service';

describe('OffreEmploiService', () => {
  let service: OffreEmploiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OffreEmploiService],
    }).compile();

    service = module.get<OffreEmploiService>(OffreEmploiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
