import { Test, TestingModule } from '@nestjs/testing';
import { OffreEmploiController } from './offre-emploi.controller';
import { OffreEmploiService } from './offre-emploi.service';

describe('OffreEmploiController', () => {
  let controller: OffreEmploiController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OffreEmploiController],
      providers: [OffreEmploiService],
    }).compile();

    controller = module.get<OffreEmploiController>(OffreEmploiController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
