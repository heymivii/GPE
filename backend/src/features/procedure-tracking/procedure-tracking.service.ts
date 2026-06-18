import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcedureTracking } from './entities/procedure-tracking.entity';
import { CreateProcedureTrackingDto } from './dto/create-procedure-tracking.dto';
import { UpdateProcedureTrackingDto } from './dto/update-procedure-tracking.dto';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { AdminProcedure } from '../admin-procedure/entities/admin-procedure.entity';

@Injectable()
export class ProcedureTrackingService {
  constructor(
    @InjectRepository(ProcedureTracking)
    private readonly trackingRepository: Repository<ProcedureTracking>,
    @InjectRepository(ExpatriationProject)
    private readonly projectRepository: Repository<ExpatriationProject>,
    @InjectRepository(AdminProcedure)
    private readonly adminProcedureRepository: Repository<AdminProcedure>,
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

  async findAllByUser(userId: number, projectId?: number): Promise<ProcedureTracking[]> {
    if (projectId) {
      const project = await this.projectRepository.findOne({
        where: { idProject: projectId, userId: userId },
      });
      if (!project) {
        throw new NotFoundException(`Projet avec l'ID ${projectId} introuvable`);
      }

      const adminProcedures = await this.adminProcedureRepository.find({
        where: { country: { idCountry: project.destinationCountryId } },
      });

      const existingTrackings = await this.trackingRepository.find({
        where: { project: { idProject: projectId }, user: { idUser: userId } },
        relations: ['admin_procedure'],
      });

      const missingProcedures = adminProcedures.filter(
        (ap) => !existingTrackings.some((et) => et.admin_procedure?.idAdminProcedure === ap.idAdminProcedure)
      );

      if (missingProcedures.length > 0) {
        const newTrackings = missingProcedures.map((ap) =>
          this.trackingRepository.create({
            status: 'not_started',
            user: { idUser: userId } as any,
            project: { idProject: projectId } as any,
            admin_procedure: ap,
          })
        );
        await this.trackingRepository.save(newTrackings);
      }

      const allTrackings = await this.trackingRepository.find({
        where: { project: { idProject: projectId }, user: { idUser: userId } },
        relations: ['admin_procedure', 'project'],
      });

      return allTrackings.sort((a, b) => {
        const orderA = a.admin_procedure?.stepOrder ?? 0;
        const orderB = b.admin_procedure?.stepOrder ?? 0;
        return orderA - orderB;
      });
    }

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

    if (updateDto.status === 'completed' && !tracking.end_date) {
      tracking.end_date = new Date().toISOString().split('T')[0];
    }

    if (updateDto.status === 'not_started' || updateDto.status === 'in_progress') {
      tracking.end_date = null;
    }

    return await this.trackingRepository.save(tracking);
  }

  async remove(id: number): Promise<void> {
    const tracking = await this.findOne(id);
    await this.trackingRepository.remove(tracking);
  }

  async getBuddies(
    procedureId: number,
    countryId: number,
    currentUserId: number,
  ): Promise<{ idUser: number; firstname: string; originCountry: string; completedAt: string }[]> {
    const trackings = await this.trackingRepository.find({
      where: {
        admin_procedure: { idAdminProcedure: procedureId },
        status: 'completed',
        project: { destinationCountryId: countryId },
      },
      relations: ['user', 'user.originCountry', 'project'],
      order: { end_date: 'DESC' },
      take: 4,
    });

    return trackings
      .filter((t) => {
        if (t.user?.idUser === currentUserId) return false;
        if (!t.end_date) return false;
        return true;
      })
      .slice(0, 3)
      .map((t) => ({
        idUser: t.user?.idUser,
        firstname: t.user?.firstName ?? 'Quelqu\'un',
        originCountry: t.user?.originCountry?.countryName ?? '',
        completedAt: t.end_date!,
      }));
  }
}
