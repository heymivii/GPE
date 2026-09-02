import { Test, TestingModule } from '@nestjs/testing';
import { OecdMigrationController } from './oecd-migration.controller';
import { OecdMigrationService } from './oecd-migration.service';

describe('OecdMigrationController', () => {
  let controller: OecdMigrationController;
  let service: jest.Mocked<OecdMigrationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OecdMigrationController],
      providers: [
        {
          provide: OecdMigrationService,
          useValue: {
            getMigrationData: jest.fn(),
            getByCountry: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<OecdMigrationController>(OecdMigrationController);
    service = module.get(OecdMigrationService);
  });

  it('findAll delegates to getMigrationData', () => {
    controller.findAll();
    expect(service.getMigrationData).toHaveBeenCalled();
  });

  it('findOne delegates to getByCountry with the code param', () => {
    controller.findOne('fr');
    expect(service.getByCountry).toHaveBeenCalledWith('fr');
  });
});
