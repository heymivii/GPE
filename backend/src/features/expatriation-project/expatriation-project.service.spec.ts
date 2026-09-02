import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { ExpatriationProjectService } from './expatriation-project.service';
import { ExpatriationProject } from './entities/expatriation-project.entity';
import { User } from '../user/entities/user.entity';

const FRANCE = 1;
const CANADA = 2;

describe('ExpatriationProjectService — destination ≠ pays de départ', () => {
  let service: ExpatriationProjectService;
  let projectRepo: {
    create: jest.Mock;
    save: jest.Mock;
    findOne: jest.Mock;
  };
  let userRepo: { findOne: jest.Mock };

  beforeEach(async () => {
    projectRepo = {
      create: jest.fn((v) => v),
      save: jest.fn((v) => Promise.resolve({ idProject: 10, ...v })),
      findOne: jest.fn(),
    };
    userRepo = { findOne: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpatriationProjectService,
        { provide: getRepositoryToken(ExpatriationProject), useValue: projectRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
      ],
    }).compile();

    service = module.get<ExpatriationProjectService>(ExpatriationProjectService);
  });

  describe('create', () => {
    it('refuse un projet dont la destination est le pays de départ du profil', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 3, countryOriginId: FRANCE });

      await expect(
        service.create(3, { destinationCountryId: FRANCE }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(projectRepo.save).not.toHaveBeenCalled();
    });

    it('accepte une destination différente du pays de départ', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 3, countryOriginId: FRANCE });

      await expect(
        service.create(3, { destinationCountryId: CANADA }),
      ).resolves.toEqual(expect.objectContaining({ destinationCountryId: CANADA }));
    });

    it('laisse passer un profil sans pays de départ renseigné', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 3, countryOriginId: null });

      await expect(
        service.create(3, { destinationCountryId: FRANCE }),
      ).resolves.toEqual(expect.objectContaining({ destinationCountryId: FRANCE }));
    });
  });

  describe('update', () => {
    beforeEach(() => {
      projectRepo.findOne.mockResolvedValue({
        idProject: 10,
        userId: 3,
        destinationCountryId: CANADA,
      });
    });

    it('refuse de basculer la destination sur le pays de départ', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 3, countryOriginId: FRANCE });

      await expect(
        service.update(10, 3, { destinationCountryId: FRANCE }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(projectRepo.save).not.toHaveBeenCalled();
    });

    it('ne bloque pas une mise à jour qui ne touche pas la destination', async () => {
      userRepo.findOne.mockResolvedValue({ idUser: 3, countryOriginId: FRANCE });

      await expect(service.update(10, 3, { budget: 1200 })).resolves.toEqual(
        expect.objectContaining({ budget: 1200 }),
      );
      expect(userRepo.findOne).not.toHaveBeenCalled();
    });
  });
});
