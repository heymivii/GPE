import { Test, TestingModule } from '@nestjs/testing';
import { IndustrySectorController } from './industry-sector.controller';
import { IndustrySectorService } from './industry-sector.service';

describe('IndustrySectorController', () => {
  let controller: IndustrySectorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IndustrySectorController],
      providers: [IndustrySectorService],
    }).compile();

    controller = module.get<IndustrySectorController>(IndustrySectorController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
