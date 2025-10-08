import { Test, TestingModule } from '@nestjs/testing';
import { CoutVieController } from './cout-vie.controller';
import { CoutVieService } from './cout-vie.service';

describe('CoutVieController', () => {
  let controller: CoutVieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoutVieController],
      providers: [CoutVieService],
    }).compile();

    controller = module.get<CoutVieController>(CoutVieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
