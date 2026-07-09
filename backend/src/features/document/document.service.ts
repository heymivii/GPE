import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDocument } from './entities/user-document.entity';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { DocumentStorageService } from './document-storage.service';

export interface UploadedFileLike {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Types autorisés + leur signature binaire (magic bytes) — on ne fait pas confiance
// au mimetype fourni par le client, on vérifie le contenu réel.
const ALLOWED: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
};

function magicMatches(mime: string, buf: Buffer): boolean {
  const sig = ALLOWED[mime];
  if (!sig) return false;
  if (buf.length < sig.length) return false;
  return sig.every((b, i) => buf[i] === b);
}

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(UserDocument)
    private readonly documentRepo: Repository<UserDocument>,
    @InjectRepository(ExpatriationProject)
    private readonly projectRepo: Repository<ExpatriationProject>,
    private readonly storage: DocumentStorageService,
  ) {}

  private async assertOwnsProject(
    projectId: number,
    userId: number,
  ): Promise<void> {
    const project = await this.projectRepo.findOne({
      where: { idProject: projectId },
    });
    if (!project) throw new NotFoundException('Projet introuvable');
    if (project.userId !== userId) {
      throw new ForbiddenException('Accès refusé à ce projet');
    }
  }

  async create(
    userId: number,
    projectId: number,
    procedureTrackingId: number | undefined,
    file: UploadedFileLike,
  ): Promise<UserDocument> {
    if (!file) throw new BadRequestException('Aucun fichier fourni');
    await this.assertOwnsProject(projectId, userId);

    if (!ALLOWED[file.mimetype] || !magicMatches(file.mimetype, file.buffer)) {
      throw new BadRequestException(
        'Type de fichier non autorisé (PDF, JPEG ou PNG uniquement)',
      );
    }

    const storageKey = this.storage.newStorageKey();
    await this.storage.write(storageKey, file.buffer);

    const doc = this.documentRepo.create({
      originalName: file.originalname.slice(0, 255),
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storageKey,
      user: { idUser: userId } as any,
      project: { idProject: projectId } as any,
      procedureTracking: procedureTrackingId
        ? ({ idProcedureTracking: procedureTrackingId } as any)
        : null,
    });
    return this.documentRepo.save(doc);
  }

  async listByProject(
    userId: number,
    projectId: number,
  ): Promise<UserDocument[]> {
    await this.assertOwnsProject(projectId, userId);
    return this.documentRepo.find({
      where: { project: { idProject: projectId }, user: { idUser: userId } },
      relations: ['procedureTracking'],
      order: { createdAt: 'DESC' },
    });
  }

  async listByProcedure(
    userId: number,
    procedureTrackingId: number,
  ): Promise<UserDocument[]> {
    return this.documentRepo.find({
      where: {
        procedureTracking: { idProcedureTracking: procedureTrackingId },
        user: { idUser: userId },
      },
      order: { createdAt: 'DESC' },
    });
  }

  /** Récupère un document EN VÉRIFIANT la propriété — jamais accessible à un autre user. */
  async findOwned(id: number, userId: number): Promise<UserDocument> {
    const doc = await this.documentRepo.findOne({
      where: { idDocument: id },
      relations: ['user'],
    });
    if (!doc) throw new NotFoundException('Document introuvable');
    if (doc.user?.idUser !== userId) {
      throw new ForbiddenException('Accès refusé à ce document');
    }
    return doc;
  }

  async getForDownload(
    id: number,
    userId: number,
  ): Promise<{ doc: UserDocument; data: Buffer }> {
    const doc = await this.findOwned(id, userId);
    const data = await this.storage.read(doc.storageKey);
    return { doc, data };
  }

  async remove(id: number, userId: number): Promise<void> {
    const doc = await this.findOwned(id, userId);
    await this.storage.delete(doc.storageKey);
    await this.documentRepo.remove(doc);
  }
}
