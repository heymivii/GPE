import { Test, TestingModule } from '@nestjs/testing';
import { ContinentController } from './continent.controller';
import { ContinentService } from './continent.service';

describe('ContinentController', () => {
  let controller: ContinentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContinentController],
      providers: [ContinentService],
    }).compile();

    controller = module.get<ContinentController>(ContinentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
