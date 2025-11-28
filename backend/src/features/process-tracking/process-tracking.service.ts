import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcessTracking } from './entities/process-tracking.entity';
import { CreateProcessTrackingDto } from './dto/create-process-tracking.dto';
import { UpdateProcessTrackingDto } from './dto/update-process-tracking.dto';

@Injectable()
export class ProcessTrackingService {
  constructor(
    @InjectRepository(ProcessTracking)
    private processTrackingRepository: Repository<ProcessTracking>,
  ) {}

  async create(
    createProcessTrackingDto: CreateProcessTrackingDto,
  ): Promise<ProcessTracking> {
    const tracking = this.processTrackingRepository.create(
      createProcessTrackingDto,
    );
    return await this.processTrackingRepository.save(tracking);
  }

  async findAll(): Promise<ProcessTracking[]> {
    return await this.processTrackingRepository.find({
      relations: ['user', 'administrativeProcess', 'project'],
    });
  }

  async findByUser(userId: number): Promise<ProcessTracking[]> {
    return await this.processTrackingRepository.find({
      where: { id_user: userId },
      relations: ['user', 'administrativeProcess', 'project'],
    });
  }

  async findByProject(projectId: number): Promise<ProcessTracking[]> {
    return await this.processTrackingRepository.find({
      where: { id_project: projectId },
      relations: ['user', 'administrativeProcess', 'project'],
    });
  }

  async findOne(id: number): Promise<ProcessTracking> {
    const tracking = await this.processTrackingRepository.findOne({
      where: { id_tracking: id },
      relations: ['user', 'administrativeProcess', 'project'],
    });

    if (!tracking) {
      throw new NotFoundException(`Process tracking with ID ${id} not found`);
    }

    return tracking;
  }

  async update(
    id: number,
    updateProcessTrackingDto: UpdateProcessTrackingDto,
  ): Promise<ProcessTracking> {
    await this.findOne(id); // Vérifie que ça existe
    await this.processTrackingRepository.update(id, updateProcessTrackingDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const tracking = await this.findOne(id);
    await this.processTrackingRepository.remove(tracking);
  }
}
