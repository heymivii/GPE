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
import { CreateExpatriationProjectDto } from './dto/create-expatriation-project.dto';
import { UpdateExpatriationProjectDto } from './dto/update-expatriation-project.dto';

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
      userId: userId,
    });
    return await this.projectRepository.save(project);
  }

  async findAllByUser(userId: number): Promise<ExpatriationProject[]> {
    return await this.projectRepository.find({
      where: { userId: userId },
    });
  }

  async findOne(
    projectId: number,
    userId: number,
  ): Promise<ExpatriationProject> {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
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

    Object.assign(project, updateDto);
    return await this.projectRepository.save(project);
  }

  async remove(projectId: number, userId: number): Promise<void> {
    const project = await this.findOne(projectId, userId);
    await this.projectRepository.remove(project);
  }

  async countByUser(userId: number): Promise<number> {
    return await this.projectRepository.count({
      where: { userId: userId },
    });
  }
}
