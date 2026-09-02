import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpertApplication } from './entities/expert-application.entity';
import { CreateExpertApplicationDto } from './dto/create-expert-application.dto';
import { ReviewExpertApplicationDto } from './dto/review-expert-application.dto';
import { DocumentStorageService } from '../document/document-storage.service';
import { UserService } from '../user/user.service';

export interface UploadedFileLike {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// On ne fait pas confiance au mimetype déclaré par le client : on vérifie la
// signature binaire réelle, comme pour les documents personnels.
const ALLOWED: Record<string, number[]> = {
  'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
};

function magicMatches(mime: string, buf: Buffer): boolean {
  const sig = ALLOWED[mime];
  if (!sig || buf.length < sig.length) return false;
  return sig.every((b, i) => buf[i] === b);
}

@Injectable()
export class ExpertApplicationService {
  constructor(
    @InjectRepository(ExpertApplication)
    private readonly applicationRepo: Repository<ExpertApplication>,
    private readonly storage: DocumentStorageService,
    private readonly userService: UserService,
  ) {}

  /**
   * Dépose une candidature. Une seule demande en attente à la fois, sinon un
   * candidat pourrait noyer la file de modération en re-postulant en boucle.
   */
  async create(
    userId: number,
    dto: CreateExpertApplicationDto,
    file: UploadedFileLike,
  ): Promise<ExpertApplication> {
    if (!file) throw new BadRequestException('Aucun justificatif fourni');

    if (!ALLOWED[file.mimetype] || !magicMatches(file.mimetype, file.buffer)) {
      throw new BadRequestException(
        'Justificatif non autorisé (PDF, JPEG ou PNG uniquement)',
      );
    }

    const pending = await this.applicationRepo.findOne({
      where: { userId, status: 'pending' },
    });
    if (pending) {
      throw new ConflictException(
        'Vous avez déjà une candidature en cours d’examen.',
      );
    }

    const diplomaStorageKey = this.storage.newStorageKey();
    await this.storage.write(diplomaStorageKey, file.buffer);

    const application = this.applicationRepo.create({
      userId,
      expertTitle: dto.expertTitle,
      motivation: dto.motivation,
      countryId: dto.countryId ?? null,
      diplomaOriginalName: file.originalname.slice(0, 255),
      diplomaMimeType: file.mimetype,
      diplomaSizeBytes: file.size,
      diplomaStorageKey,
      status: 'pending',
    });

    return this.applicationRepo.save(application);
  }

  /** Historique des candidatures du demandeur, la plus récente en tête. */
  async findMine(userId: number): Promise<ExpertApplication[]> {
    return this.applicationRepo.find({
      where: { userId },
      relations: ['country'],
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(status?: string): Promise<ExpertApplication[]> {
    return this.applicationRepo.find({
      where: status ? { status: status as any } : {},
      relations: ['user', 'country'],
      // Les demandes en attente d'abord : c'est la file de travail du modérateur.
      order: { status: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<ExpertApplication> {
    const application = await this.applicationRepo.findOne({
      where: { idExpertApplication: id },
      relations: ['user', 'country'],
    });
    if (!application) throw new NotFoundException('Candidature introuvable');
    return application;
  }

  /** Lit le justificatif déchiffré — réservé aux admins côté contrôleur. */
  async readDiploma(
    id: number,
  ): Promise<{ buffer: Buffer; mimeType: string; filename: string }> {
    const application = await this.findOne(id);
    return {
      buffer: await this.storage.read(application.diplomaStorageKey),
      mimeType: application.diplomaMimeType,
      filename: application.diplomaOriginalName,
    };
  }

  /**
   * Tranche une candidature. Une approbation promeut réellement le compte en
   * expert vérifié : c'est ce qui le fait apparaître sur /experts.
   */
  async review(
    id: number,
    dto: ReviewExpertApplicationDto,
    reviewerId: number,
  ): Promise<ExpertApplication> {
    const application = await this.findOne(id);

    if (application.status !== 'pending') {
      throw new ConflictException('Cette candidature a déjà été traitée.');
    }

    application.status = dto.status;
    application.reviewNote = dto.reviewNote ?? null;
    application.reviewedBy = reviewerId;
    application.reviewedAt = new Date();

    if (dto.status === 'approved') {
      await this.userService.verifyExpert(
        application.userId,
        {
          expertTitle: application.expertTitle,
          expertBio: application.motivation,
          expertCountryId: application.countryId ?? undefined,
        },
        reviewerId,
      );
    }

    return this.applicationRepo.save(application);
  }

  async countPending(): Promise<number> {
    return this.applicationRepo.count({ where: { status: 'pending' } });
  }
}
