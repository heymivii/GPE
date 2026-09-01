import { Test, TestingModule } from '@nestjs/testing';
import { GlobalSearchController } from './global-search.controller';
import { GlobalSearchService } from './global-search.service';

describe('GlobalSearchController', () => {
  let controller: GlobalSearchController;
  let service: jest.Mocked<GlobalSearchService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GlobalSearchController],
      providers: [
        {
          provide: GlobalSearchService,
          useValue: {
            search: jest.fn(),
            refreshIndex: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GlobalSearchController>(GlobalSearchController);
    service = module.get(GlobalSearchService);
  });

  it('search delegates the query dto to the service', () => {
    const dto = { q: 'paris' } as any;
    controller.search(dto);
    expect(service.search).toHaveBeenCalledWith(dto);
  });

  it('refresh delegates to the service', () => {
    controller.refresh();
    expect(service.refreshIndex).toHaveBeenCalled();
  });
});
