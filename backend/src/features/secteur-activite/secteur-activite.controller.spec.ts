import { Test, TestingModule } from '@nestjs/testing';
import { SecteurActiviteController } from './secteur-activite.controller';
import { SecteurActiviteService } from './secteur-activite.service';

describe('SecteurActiviteController', () => {
  let controller: SecteurActiviteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SecteurActiviteController],
      providers: [SecteurActiviteService],
    }).compile();

    controller = module.get<SecteurActiviteController>(SecteurActiviteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
