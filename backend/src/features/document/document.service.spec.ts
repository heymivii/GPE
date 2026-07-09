import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
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
});
