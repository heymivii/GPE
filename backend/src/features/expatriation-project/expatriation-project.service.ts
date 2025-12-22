import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  ExpatriationProject,
  ChecklistProgress,
} from './entities/expatriation-project.entity';
import { CreateExpatriationProjectDto } from './dto/create-expatriation-project.dto';
import { UpdateExpatriationProjectDto } from './dto/update-expatriation-project.dto';
import { UpdateChecklistProgressDto } from './dto/update-checklist-progress.dto';

@Injectable()
export class ExpatriationProjectService {
  constructor(
    @InjectRepository(ExpatriationProject)
    private readonly projectRepository: Repository<ExpatriationProject>,
  ) {}

  async create(
    userId: number,
    createDto: CreateExpatriationProjectDto,
  ): Promise<ExpatriationProject> {
    const project = this.projectRepository.create({
      ...createDto,
      idUser: userId,
    });
    return await this.projectRepository.save(project);
  }

  async findAllByUser(userId: number): Promise<ExpatriationProject[]> {
    return await this.projectRepository.find({
      where: { idUser: userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(projectId: number, userId: number): Promise<ExpatriationProject> {
    const project = await this.projectRepository.findOne({
      where: { idProject: projectId },
    });

    if (!project) {
      throw new NotFoundException(
        `Projet avec l'ID ${projectId} introuvable`,
      );
    }

    if (project.idUser !== userId) {
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

    Object.assign(project, updateDto);
    return await this.projectRepository.save(project);
  }

  async remove(projectId: number, userId: number): Promise<void> {
    const project = await this.findOne(projectId, userId);
    await this.projectRepository.remove(project);
  }

  async countByUser(userId: number): Promise<number> {
    return await this.projectRepository.count({
      where: { idUser: userId },
    });
  }

  async updateChecklistProgress(
    projectId: number,
    userId: number,
    dto: UpdateChecklistProgressDto,
  ): Promise<ExpatriationProject> {
    const project = await this.findOne(projectId, userId);

    if (!project.checklistProgress) {
      project.checklistProgress = {};
    }

    if (dto.substepId) {
      if (!project.checklistProgress[dto.stepId]) {
        project.checklistProgress[dto.stepId] = {
          completed: false,
          substeps: {},
        };
      }

      if (!project.checklistProgress[dto.stepId].substeps) {
        project.checklistProgress[dto.stepId].substeps = {};
      }

      project.checklistProgress[dto.stepId].substeps![dto.substepId] = {
        completed: dto.completed,
        completedAt: dto.completed ? new Date().toISOString() : undefined,
      };

      const substeps = project.checklistProgress[dto.stepId].substeps!;
      const allSubstepsCompleted = Object.values(substeps).every(
        (s) => s.completed,
      );

      project.checklistProgress[dto.stepId].completed = allSubstepsCompleted;
      if (allSubstepsCompleted) {
        project.checklistProgress[dto.stepId].completedAt =
          new Date().toISOString();
      }
    } else {
      project.checklistProgress[dto.stepId] = {
        completed: dto.completed,
        completedAt: dto.completed ? new Date().toISOString() : undefined,
        substeps: project.checklistProgress[dto.stepId]?.substeps || {},
      };
    }

    return await this.projectRepository.save(project);
  }

  async getChecklistProgress(
    projectId: number,
    userId: number,
  ): Promise<ChecklistProgress> {
    const project = await this.projectRepository.findOne({
      where: { idProject: projectId, idUser: userId },
      select: ['checklistProgress'],
    });

    if (!project) {
      throw new NotFoundException(`Projet avec l'ID ${projectId} introuvable`);
    }

    return project.checklistProgress || {};
  }
}

