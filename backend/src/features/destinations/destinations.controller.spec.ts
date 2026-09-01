import { Test, TestingModule } from '@nestjs/testing';
import { DestinationsController } from './destinations.controller';
import { DestinationsService } from './destinations.service';

describe('DestinationsController', () => {
  let controller: DestinationsController;
  let service: jest.Mocked<DestinationsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DestinationsController],
      providers: [
        {
          provide: DestinationsService,
          useValue: {
            findAllCountries: jest.fn(),
            findOneCountryBySlug: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<DestinationsController>(DestinationsController);
    service = module.get(DestinationsService);
  });

  it('findAll delegates to findAllCountries', () => {
    controller.findAll();
    expect(service.findAllCountries).toHaveBeenCalled();
  });

  it('findOne delegates to findOneCountryBySlug with the slug param', () => {
    controller.findOne('france');
    expect(service.findOneCountryBySlug).toHaveBeenCalledWith('france');
  });
});
