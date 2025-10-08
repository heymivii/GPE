import { Test, TestingModule } from '@nestjs/testing';
import { PaysController } from './pays.controller';
import { PaysService } from './pays.service';

describe('PaysController', () => {
  let controller: PaysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaysController],
      providers: [PaysService],
    }).compile();

    controller = module.get<PaysController>(PaysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
