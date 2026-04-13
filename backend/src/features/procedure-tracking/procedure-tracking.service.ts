import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcedureTracking } from './entities/procedure-tracking.entity';
import { CreateProcedureTrackingDto } from './dto/create-procedure-tracking.dto';
import { UpdateProcedureTrackingDto } from './dto/update-procedure-tracking.dto';

@Injectable()
export class ProcedureTrackingService {
  constructor(
    @InjectRepository(ProcedureTracking)
    private readonly trackingRepository: Repository<ProcedureTracking>,
  ) {}

  async create(userId: number, createDto: CreateProcedureTrackingDto): Promise<ProcedureTracking> {
    const tracking = this.trackingRepository.create({
      status: createDto.status ?? 'not_started',
      start_date: createDto.startDate,
      end_date: createDto.endDate,
      user: { idUser: userId } as any,
      admin_procedure: { idAdminProcedure: createDto.adminProcedureId } as any,
      project: { idProject: createDto.expatProjectId } as any,
    });
    return await this.trackingRepository.save(tracking);
  }

  async findAllByUser(userId: number): Promise<ProcedureTracking[]> {
    return await this.trackingRepository.find({
      where: { user: { idUser: userId } },
      relations: ['admin_procedure', 'project'],
    });
  }

  async findOne(id: number): Promise<ProcedureTracking> {
    const tracking = await this.trackingRepository.findOne({
      where: { idProcedureTracking: id },
      relations: ['user', 'admin_procedure', 'project'],
    });
    if (!tracking) {
      throw new NotFoundException(`Suivi de procédure avec l'ID ${id} introuvable`);
    }
    return tracking;
  }

  async update(id: number, updateDto: UpdateProcedureTrackingDto): Promise<ProcedureTracking> {
    const tracking = await this.findOne(id);
    Object.assign(tracking, updateDto);
    return await this.trackingRepository.save(tracking);
  }

  async remove(id: number): Promise<void> {
    const tracking = await this.findOne(id);
    await this.trackingRepository.remove(tracking);
  }
}
