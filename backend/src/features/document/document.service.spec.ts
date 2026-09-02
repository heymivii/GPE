import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { DocumentService, UploadedFileLike } from './document.service';
import { DocumentStorageService } from './document-storage.service';
import { UserDocument } from './entities/user-document.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';

const pdf: UploadedFileLike = {
  originalname: 'passeport.pdf',
  mimetype: 'application/pdf',
  size: 4,
  buffer: Buffer.from([0x25, 0x50, 0x44, 0x46]), // %PDF
};

describe('DocumentService (sécurité)', () => {
  let service: DocumentService;
  let docRepo: any;
  let projectRepo: any;
  let storage: any;

  beforeEach(async () => {
    docRepo = {
      create: jest.fn((x) => x),
      save: jest.fn(async (x) => ({ ...x, idDocument: 1 })),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };
    projectRepo = { findOne: jest.fn() };
    storage = {
      newStorageKey: jest.fn(() => 'key-1'),
      write: jest.fn(),
      read: jest.fn(async () => Buffer.from('data')),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        { provide: getRepositoryToken(UserDocument), useValue: docRepo },
        { provide: getRepositoryToken(ExpatriationProject), useValue: projectRepo },
        { provide: DocumentStorageService, useValue: storage },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it("refuse l'upload sur un projet qui n'est pas le sien", async () => {
    projectRepo.findOne.mockResolvedValue({ idProject: 1, userId: 99 });
    await expect(service.create(1, 1, undefined, 'passport',pdf)).rejects.toThrow(
      ForbiddenException,
    );
    expect(storage.write).not.toHaveBeenCalled();
  });

  it('refuse un fichier dont le contenu ne correspond pas au type (magic bytes)', async () => {
    projectRepo.findOne.mockResolvedValue({ idProject: 1, userId: 1 });
    const fake = { ...pdf, buffer: Buffer.from('ceci n est pas un pdf') };
    await expect(service.create(1, 1, undefined, 'passport',fake)).rejects.toThrow(
      BadRequestException,
    );
    expect(storage.write).not.toHaveBeenCalled();
  });

  it('stocke un fichier valide et possédé, avec son type', async () => {
    projectRepo.findOne.mockResolvedValue({ idProject: 1, userId: 1 });
    const res = await service.create(1, 1, undefined, 'passport', pdf);
    expect(storage.write).toHaveBeenCalledWith('key-1', pdf.buffer);
    expect(res.idDocument).toBe(1);
    expect(res.docType).toBe('passport');
  });

  it('normalise un type inconnu en "other"', async () => {
    projectRepo.findOne.mockResolvedValue({ idProject: 1, userId: 1 });
    const res = await service.create(1, 1, undefined, 'n_importe_quoi', pdf);
    expect(res.docType).toBe('other');
  });

  it("refuse le téléchargement du document d'autrui", async () => {
    docRepo.findOne.mockResolvedValue({
      idDocument: 5,
      user: { idUser: 99 },
      storageKey: 'k',
    });
    await expect(service.getForDownload(5, 1)).rejects.toThrow(
      ForbiddenException,
    );
    expect(storage.read).not.toHaveBeenCalled();
  });

  it('supprime le fichier ET la ligne au remove (propriétaire)', async () => {
    docRepo.findOne.mockResolvedValue({
      idDocument: 5,
      user: { idUser: 1 },
      storageKey: 'k',
    });
    await service.remove(5, 1);
    expect(storage.delete).toHaveBeenCalledWith('k');
    expect(docRepo.remove).toHaveBeenCalled();
  });

  it("refuse la création sans fichier", async () => {
    await expect(
      service.create(1, undefined, undefined, 'passport', undefined as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('accepte un document sans projet (coffre personnel), sans vérifier de propriété', async () => {
    const res = await service.create(1, undefined, undefined, 'passport', pdf);
    expect(projectRepo.findOne).not.toHaveBeenCalled();
    expect(res.project).toBeNull();
  });

  it('rattache la procédure quand procedureTrackingId est fourni', async () => {
    const res = await service.create(1, undefined, 7, 'passport', pdf);
    expect(res.procedureTracking).toEqual({ idProcedureTracking: 7 });
  });

  describe('findOwned()', () => {
    it("lève NotFoundException quand le document n'existe pas", async () => {
      docRepo.findOne.mockResolvedValue(null);
      await expect(service.findOwned(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retourne le document quand il appartient à l’utilisateur', async () => {
      docRepo.findOne.mockResolvedValue({
        idDocument: 5,
        user: { idUser: 1 },
      });
      const doc = await service.findOwned(5, 1);
      expect(doc.idDocument).toBe(5);
    });
  });

  describe('getForDownload()', () => {
    it('retourne le document et ses données lues depuis le storage', async () => {
      docRepo.findOne.mockResolvedValue({
        idDocument: 5,
        user: { idUser: 1 },
        storageKey: 'k',
      });
      const result = await service.getForDownload(5, 1);
      expect(storage.read).toHaveBeenCalledWith('k');
      expect(result.data).toEqual(Buffer.from('data'));
    });
  });

  describe('listAllByUser()', () => {
    it('liste tous les documents de l’utilisateur, triés par date', async () => {
      docRepo.find.mockResolvedValue([{ idDocument: 1 }]);
      const result = await service.listAllByUser(1);
      expect(docRepo.find).toHaveBeenCalledWith({
        where: { user: { idUser: 1 } },
        relations: ['project', 'project.destinationCountry', 'procedureTracking'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([{ idDocument: 1 }]);
    });
  });

  describe('listByProject()', () => {
    it("vérifie la propriété du projet avant de lister", async () => {
      projectRepo.findOne.mockResolvedValue({ idProject: 1, userId: 1 });
      docRepo.find.mockResolvedValue([{ idDocument: 1 }]);
      const result = await service.listByProject(1, 1);
      expect(docRepo.find).toHaveBeenCalledWith({
        where: { project: { idProject: 1 }, user: { idUser: 1 } },
        relations: ['procedureTracking'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([{ idDocument: 1 }]);
    });

    it("refuse de lister un projet qui n'est pas le sien", async () => {
      projectRepo.findOne.mockResolvedValue({ idProject: 1, userId: 99 });
      await expect(service.listByProject(1, 1)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("lève NotFoundException quand le projet n'existe pas", async () => {
      projectRepo.findOne.mockResolvedValue(null);
      await expect(service.listByProject(1, 999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('listByProcedure()', () => {
    it('liste les documents rattachés à une procédure', async () => {
      docRepo.find.mockResolvedValue([{ idDocument: 1 }]);
      const result = await service.listByProcedure(1, 7);
      expect(docRepo.find).toHaveBeenCalledWith({
        where: {
          procedureTracking: { idProcedureTracking: 7 },
          user: { idUser: 1 },
        },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual([{ idDocument: 1 }]);
    });
  });
});
