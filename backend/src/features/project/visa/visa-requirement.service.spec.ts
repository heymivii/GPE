import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { VisaRequirementService } from './visa-requirement.service';
import { VisaRequirement } from './visa-requirement.entity';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('VisaRequirementService', () => {
  let service: VisaRequirementService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VisaRequirementService,
        { provide: getRepositoryToken(VisaRequirement), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<VisaRequirementService>(VisaRequirementService);
    repo = module.get(getRepositoryToken(VisaRequirement));
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('wraps origin/destination ids into country relations', async () => {
      const dto = {
        originCountryId: 1,
        destinationCountryId: 2,
        visaRequired: true,
      } as any;
      repo.create.mockImplementation((v: any) => v);
      repo.save.mockImplementation((v: any) => Promise.resolve(v));

      const result = await service.create(dto);

      expect(result.originCountry).toEqual({ idCountry: 1 });
      expect(result.destinationCountry).toEqual({ idCountry: 2 });
    });
  });

  describe('findAll', () => {
    it('loads country relations', async () => {
      repo.find.mockResolvedValue([{ idVisaRequirement: 1 }]);
      await service.findAll();
      expect(repo.find).toHaveBeenCalledWith({
        relations: ['originCountry', 'destinationCountry'],
      });
    });
  });

  describe('findByCountries', () => {
    it('filters by origin and destination country ids', async () => {
      repo.find.mockResolvedValue([]);
      await service.findByCountries(1, 2);
      expect(repo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            originCountry: { idCountry: 1 },
            destinationCountry: { idCountry: 2 },
          },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('returns the requirement when found', async () => {
      const req = { idVisaRequirement: 1 };
      repo.findOne.mockResolvedValue(req);
      const result = await service.findOne(1);
      expect(result).toEqual(req);
    });
  });

  describe('remove', () => {
    it('removes the requirement when found', async () => {
      const req = { idVisaRequirement: 1 };
      repo.findOne.mockResolvedValue(req);
      repo.remove.mockResolvedValue(undefined);
      await service.remove(1);
      expect(repo.remove).toHaveBeenCalledWith(req);
    });
  });
});
