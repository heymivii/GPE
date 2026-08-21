import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CountryService } from './country/country.service';
import { CityService } from './city/city.service';
import { ContinentService } from './continent/continent.service';
import { AdminProcedureService } from './admin-procedure/admin-procedure.service';
import { Country } from './country/entities/country.entity';
import { City } from './city/entities/city.entity';
import { Continent } from './continent/entities/continent.entity';
import { AdminProcedure } from './admin-procedure/entities/admin-procedure.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
});

describe('CountryService', () => {
  let service: CountryService;
  let countryRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        { provide: getRepositoryToken(Country), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<CountryService>(CountryService);
    countryRepo = module.get(getRepositoryToken(Country));
    jest.clearAllMocks();
  });

  it('returns all countries', async () => {
    countryRepo.find.mockResolvedValue([{ idCountry: 1, countryName: 'France' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('throws NotFoundException when country not found', async () => {
    countryRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('creates a country', async () => {
    const c = { idCountry: 1, countryName: 'Nouvelle-Zelande', isoCode: 'NZ' };
    countryRepo.create.mockReturnValue(c);
    countryRepo.save.mockResolvedValue(c);
    const result = await service.create({ countryName: 'Nouvelle-Zelande', isoCode: 'NZ' });
    expect(result.countryName).toBe('Nouvelle-Zelande');
  });

  it('updates a country', async () => {
    const c = { idCountry: 1, countryName: 'France' };
    countryRepo.findOne.mockResolvedValue(c);
    countryRepo.save.mockResolvedValue({ ...c, countryName: 'France Updated' });
    const result = await service.update(1, { countryName: 'France Updated' });
    expect(result.countryName).toBe('France Updated');
  });

  it('removes a country', async () => {
    const c = { idCountry: 1 };
    countryRepo.findOne.mockResolvedValue(c);
    countryRepo.remove.mockResolvedValue(undefined);
    await service.remove(1);
    expect(countryRepo.remove).toHaveBeenCalledWith(c);
  });
});

describe('CityService', () => {
  let service: CityService;
  let cityRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CityService,
        { provide: getRepositoryToken(City), useFactory: mockRepo },
        { provide: getRepositoryToken(Country), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<CityService>(CityService);
    cityRepo = module.get(getRepositoryToken(City));
    jest.clearAllMocks();
  });

  it('returns all cities', async () => {
    cityRepo.find.mockResolvedValue([{ idCity: 1, cityName: 'Paris' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('throws NotFoundException when city not found', async () => {
    cityRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('creates a city', async () => {
    const city = { idCity: 1, cityName: 'Lyon', countryId: 3 };
    cityRepo.create.mockReturnValue(city);
    cityRepo.save.mockResolvedValue(city);
    const result = await service.create({ cityName: 'Lyon', countryId: 3 });
    expect(result.cityName).toBe('Lyon');
  });
});

describe('ContinentService', () => {
  let service: ContinentService;
  let continentRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContinentService,
        { provide: getRepositoryToken(Continent), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<ContinentService>(ContinentService);
    continentRepo = module.get(getRepositoryToken(Continent));
    jest.clearAllMocks();
  });

  it('returns all continents', async () => {
    continentRepo.find.mockResolvedValue([{ idContinent: 1, continentName: 'Europe' }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  it('throws NotFoundException when not found', async () => {
    continentRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('creates a continent', async () => {
    const c = { idContinent: 1, continentName: 'Oceanie' };
    continentRepo.create.mockReturnValue(c);
    continentRepo.save.mockResolvedValue(c);
    const result = await service.create({ continentName: 'Oceanie' });
    expect(result.continentName).toBe('Oceanie');
  });
});

describe('AdminProcedureService', () => {
  let service: AdminProcedureService;
  let procedureRepo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminProcedureService,
        { provide: getRepositoryToken(AdminProcedure), useFactory: mockRepo },
        { provide: getRepositoryToken(Country), useFactory: mockRepo },
      ],
    }).compile();
    service = module.get<AdminProcedureService>(AdminProcedureService);
    procedureRepo = module.get(getRepositoryToken(AdminProcedure));
    jest.clearAllMocks();
  });

  it('returns procedures for a country', async () => {
    procedureRepo.find.mockResolvedValue([{ idAdminProcedure: 1, procedureType: 'Visa' }]);
    const result = await service.findByCountry(3);
    expect(result).toHaveLength(1);
  });

  it('throws NotFoundException when procedure not found', async () => {
    procedureRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
  });

  it('creates a procedure', async () => {
    const proc = { idAdminProcedure: 1, procedureType: 'Visa', countryId: 3 };
    procedureRepo.create.mockReturnValue(proc);
    procedureRepo.save.mockResolvedValue(proc);
    const result = await service.create({ procedureType: 'Visa', countryId: 3 });
    expect(result.procedureType).toBe('Visa');
  });

  it('removes a procedure', async () => {
    const proc = { idAdminProcedure: 1 };
    procedureRepo.findOne.mockResolvedValue(proc);
    procedureRepo.remove.mockResolvedValue(undefined);
    await service.remove(1);
    expect(procedureRepo.remove).toHaveBeenCalledWith(proc);
  });
});
