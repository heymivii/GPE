import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExpatriationProject } from './entities/expatriation-project.entity';
import { CreateExpatriationProjectDto } from './dto/create-expatriation-project.dto';
import { UpdateExpatriationProjectDto } from './dto/update-expatriation-project.dto';

@Injectable()
export class ExpatriationProjectService {
  constructor(
    @InjectRepository(ExpatriationProject)
    private readonly projectRepository: Repository<ExpatriationProject>,
  ) {}

  /**
   * Create a new expatriation project for a user
   */
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

  /**
   * Get all projects for a specific user
   */
  async findAllByUser(userId: number): Promise<ExpatriationProject[]> {
    return await this.projectRepository.find({
      where: { idUser: userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a specific project by ID
   */
  async findOne(projectId: number, userId: number): Promise<ExpatriationProject> {
    const project = await this.projectRepository.findOne({
      where: { idProject: projectId },
    });

    if (!project) {
      throw new NotFoundException(
        `Projet avec l'ID ${projectId} introuvable`,
      );
    }

    // Verify that the project belongs to the user
    if (project.idUser !== userId) {
      throw new ForbiddenException(
        'Vous n\'avez pas accès à ce projet',
      );
    }

    return project;
  }

  /**
   * Update a project
   */
  async update(
    projectId: number,
    userId: number,
    updateDto: UpdateExpatriationProjectDto,
  ): Promise<ExpatriationProject> {
    const project = await this.findOne(projectId, userId);

    Object.assign(project, updateDto);
    return await this.projectRepository.save(project);
  }

  /**
   * Delete a project
   */
  async remove(projectId: number, userId: number): Promise<void> {
    const project = await this.findOne(projectId, userId);
    await this.projectRepository.remove(project);
  }

  /**
   * Get project count for a user
   */
  async countByUser(userId: number): Promise<number> {
    return await this.projectRepository.count({
      where: { idUser: userId },
    });
  }
}

