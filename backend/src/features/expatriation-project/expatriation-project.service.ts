import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ExpatriationProject,
} from './entities/expatriation-project.entity';
import { ProcedureTracking } from '../procedure-tracking/entities/procedure-tracking.entity';
import { User } from '../user/entities/user.entity';
import { CreateExpatriationProjectDto } from './dto/create-expatriation-project.dto';
import { UpdateExpatriationProjectDto } from './dto/update-expatriation-project.dto';

@Injectable()
export class ExpatriationProjectService {
  constructor(
    @InjectRepository(ExpatriationProject)
    private readonly projectRepository: Repository<ExpatriationProject>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * S'expatrier, c'est partir vers un AUTRE pays : destination == pays de départ
   * est un projet impossible. Le pays de départ n'est pas porté par le projet —
   * il vit sur le profil (`app_user.country_origin_id`) — donc on compare la
   * destination à l'origine du propriétaire. Garde-fou serveur : le wizard filtre
   * déjà les listes, mais l'API est appelable directement.
   */
  private async assertDestinationDiffersFromOrigin(
    userId: number,
    destinationCountryId?: number,
  ): Promise<void> {
    if (!destinationCountryId) return;

    const user = await this.userRepository.findOne({
      where: { idUser: userId },
      select: ['idUser', 'countryOriginId'],
    });

    if (user?.countryOriginId === destinationCountryId) {
      throw new BadRequestException(
        'Le pays de destination doit être différent de votre pays de départ',
      );
    }
  }

  async create(
    userId: number,
    createDto: CreateExpatriationProjectDto,
  ): Promise<ExpatriationProject> {
    await this.assertDestinationDiffersFromOrigin(
      userId,
      createDto.destinationCountryId,
    );

    const project = this.projectRepository.create({
      ...createDto,
      userId: userId,
    });
    return await this.projectRepository.save(project);
  }

  async findAllByUser(userId: number): Promise<ExpatriationProject[]> {
    return await this.projectRepository.find({
      where: { userId: userId },
      // Load the country so consumers (NavBar project switcher, dashboard) can label
      // a project by its destination — findOne/findAll already do this; the list must too.
      relations: ['destinationCountry', 'destinationCity', 'travelType'],
      order: { idProject: 'ASC' },
    });
  }

  async findOne(
    projectId: number,
    userId: number,
  ): Promise<ExpatriationProject> {
    const project = await this.projectRepository.findOne({
      where: { idProject: projectId },
      relations: ['destinationCountry', 'destinationCity', 'travelType'],
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${projectId} introuvable`);
    }

    if (project.userId !== userId) {
      throw new ForbiddenException("Vous n'avez pas accès à ce projet");
    }

    return project;
  }

  async update(
    projectId: number,
    userId: number,
    updateDto: UpdateExpatriationProjectDto,
  ): Promise<ExpatriationProject> {
    const project = await this.findOne(projectId, userId);

    await this.assertDestinationDiffersFromOrigin(
      userId,
      updateDto.destinationCountryId,
    );

    Object.assign(project, updateDto);
    return await this.projectRepository.save(project);
  }

  async remove(projectId: number, userId: number): Promise<void> {
    // Vérifie l'existence + la propriété (403/404 sinon).
    await this.findOne(projectId, userId);
    // `procedure_tracking` référence le projet SANS ON DELETE CASCADE → il faut
    // supprimer les enfants d'abord, dans une transaction pour rester atomique.
    // (`user_document` cascade déjà côté base, rien à faire pour lui.)
    await this.projectRepository.manager.transaction(async (em) => {
      await em
        .createQueryBuilder()
        .delete()
        .from(ProcedureTracking)
        .where('project_id = :projectId', { projectId })
        .execute();
      await em.delete(ExpatriationProject, projectId);
    });
  }

  /** Débloque le projet (paiement mock) → plan complet accessible. */
  /* ===== PRICING DÉSACTIVÉ — déblocage payant d'un projet =====
  async unlock(projectId: number, userId: number): Promise<ExpatriationProject> {
    const project = await this.findOne(projectId, userId);
    project.isPaid = true;
    return await this.projectRepository.save(project);
  }
  ===== FIN PRICING DÉSACTIVÉ ===== */

  async countByUser(userId: number): Promise<number> {
    return await this.projectRepository.count({
      where: { userId: userId },
    });
  }

  // --- Admin Methods ---

  async findAll(): Promise<ExpatriationProject[]> {
    return await this.projectRepository.find({
      relations: ['user', 'destinationCountry', 'destinationCity', 'travelType'],
      order: { idProject: 'DESC' },
    });
  }

  async adminUpdate(
    projectId: number,
    updateDto: UpdateExpatriationProjectDto,
  ): Promise<ExpatriationProject> {
    const project = await this.projectRepository.findOne({
      where: { idProject: projectId },
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${projectId} introuvable`);
    }

    Object.assign(project, updateDto);
    return await this.projectRepository.save(project);
  }
}
