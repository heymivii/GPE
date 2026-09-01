import { Test, TestingModule } from '@nestjs/testing';
import { BusinessSectorController } from './business-sector.controller';
import { BusinessSectorService } from './business-sector.service';

describe('BusinessSectorController', () => {
  let controller: BusinessSectorController;
  let service: jest.Mocked<BusinessSectorService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessSectorController],
      providers: [
        {
          provide: BusinessSectorService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BusinessSectorController>(BusinessSectorController);
    service = module.get(BusinessSectorService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('create delegates to the service', () => {
    const dto = { name: 'Tech' } as any;
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll delegates to the service', () => {
    controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('findOne converts the id param to a number', () => {
    controller.findOne('5');
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('update converts the id param to a number', () => {
    const dto = { name: 'x' } as any;
    controller.update('5', dto);
    expect(service.update).toHaveBeenCalledWith(5, dto);
  });

  it('remove converts the id param to a number', () => {
    controller.remove('5');
    expect(service.remove).toHaveBeenCalledWith(5);
  });
});
