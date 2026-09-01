import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TravelTypeService } from './travel-type.service';
import { TravelType } from './travel-type.entity';

const mockRepo = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('TravelTypeService', () => {
  let service: TravelTypeService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TravelTypeService,
        { provide: getRepositoryToken(TravelType), useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<TravelTypeService>(TravelTypeService);
    repo = module.get(getRepositoryToken(TravelType));
    jest.clearAllMocks();
  });

  it('create saves the new travel type', async () => {
    const dto = { name: 'Tourisme' } as any;
    repo.create.mockReturnValue(dto);
    repo.save.mockResolvedValue({ idTravelType: 1, ...dto });
    const result = await service.create(dto);
    expect(result).toEqual({ idTravelType: 1, name: 'Tourisme' });
  });

  it('findAll returns every travel type', async () => {
    repo.find.mockResolvedValue([{ idTravelType: 1 }]);
    const result = await service.findAll();
    expect(result).toHaveLength(1);
  });

  describe('findOne', () => {
    it('throws NotFoundException when missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it('returns the travel type when found', async () => {
      const type = { idTravelType: 1, name: 'Tourisme' };
      repo.findOne.mockResolvedValue(type);
      const result = await service.findOne(1);
      expect(result).toEqual(type);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('removes the travel type when found', async () => {
      const type = { idTravelType: 1 };
      repo.findOne.mockResolvedValue(type);
      repo.remove.mockResolvedValue(undefined);
      await service.remove(1);
      expect(repo.remove).toHaveBeenCalledWith(type);
    });
  });
});
