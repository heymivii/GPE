import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProcedureTracking } from './entities/procedure-tracking.entity';
import { CreateProcedureTrackingDto } from './dto/create-procedure-tracking.dto';
import { UpdateProcedureTrackingDto } from './dto/update-procedure-tracking.dto';
import { ExpatriationProject } from '../expatriation-project/entities/expatriation-project.entity';
import { AdminProcedure } from '../admin-procedure/entities/admin-procedure.entity';

// Les comptes e2e (…@skywalk.test) et les comptes des scripts de test API
// (…@example.com) complètent des étapes en prod : ils ne doivent jamais
// apparaître comme « buddies » (preuve sociale) auprès des vrais utilisateurs.
const TEST_EMAIL_DOMAINS = ['@skywalk.test', '@example.com'];

function isTestAccountEmail(email?: string | null): boolean {
  if (!email) return false;
  const lower = email.toLowerCase();
  return TEST_EMAIL_DOMAINS.some((domain) => lower.endsWith(domain));
}

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

  async create(
    userId: number,
    createDto: CreateProcedureTrackingDto,
  ): Promise<ProcedureTracking> {
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

  async findAllByUser(
    userId: number,
    projectId?: number,
  ): Promise<ProcedureTracking[]> {
    if (projectId) {
      const project = await this.projectRepository.findOne({
        where: { idProject: projectId, userId: userId },
      });
      if (!project) {
        throw new NotFoundException(
          `Projet avec l'ID ${projectId} introuvable`,
        );
      }

      const allAdminProcedures = await this.adminProcedureRepository.find({
        where: { country: { idCountry: project.destinationCountryId } },
      });

      // Only seed from ACTIVE procedures (archived ones are hidden — their gov_link lost verification).
      // Personnalisation stricte : une procédure ciblée (objectives non vide) n'apparaît
      // que si l'objectif du projet correspond. Objectif non renseigné → seules les
      // étapes universelles restent ; compléter le profil réactive les étapes ciblées.
      const projectObjective = project.objective;
      const matchesObjective = (ap?: AdminProcedure | null): boolean => {
        if (!ap?.objectives || ap.objectives.length === 0) return true;
        if (!projectObjective) return false;
        return ap.objectives.includes(projectObjective);
      };
      const adminProcedures = allAdminProcedures.filter(
        (ap) => ap.status === 'active' && matchesObjective(ap),
      );

      const existingTrackings = await this.trackingRepository.find({
        where: { project: { idProject: projectId }, user: { idUser: userId } },
        relations: ['admin_procedure'],
      });

      const missingProcedures = adminProcedures.filter(
        (ap) =>
          !existingTrackings.some(
            (et) =>
              et.admin_procedure?.idAdminProcedure === ap.idAdminProcedure,
          ),
      );

      if (missingProcedures.length > 0) {
        const newTrackings = missingProcedures.map((ap) =>
          this.trackingRepository.create({
            status: 'not_started',
            user: { idUser: userId } as any,
            project: { idProject: projectId } as any,
            admin_procedure: ap,
          }),
        );
        await this.trackingRepository.save(newTrackings);
      }

      const allTrackings = await this.trackingRepository.find({
        where: { project: { idProject: projectId }, user: { idUser: userId } },
        relations: ['admin_procedure', 'project'],
      });

      // Only return trackings whose admin_procedure is currently active AND still
      // matches the project objective (a retargeted procedure — ex. business passé
      // à ['work'] — disparaît des checklists study sans supprimer de lignes).
      // Archived procedures are hidden from the checklist (rows preserved for later reactivation).
      return allTrackings
        .filter(
          (t) =>
            t.admin_procedure?.status === 'active' &&
            matchesObjective(t.admin_procedure),
        )
        .sort((a, b) => {
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

  // userId requis : un suivi de procédure appartient à un utilisateur, on n'expose
  // ni ne modifie jamais celui d'un autre.
  async findOne(id: number, userId: number): Promise<ProcedureTracking> {
    const tracking = await this.trackingRepository.findOne({
      where: { idProcedureTracking: id },
      relations: ['user', 'admin_procedure', 'project'],
    });
    if (!tracking) {
      throw new NotFoundException(
        `Suivi de procédure avec l'ID ${id} introuvable`,
      );
    }
    if (tracking.user?.idUser !== userId) {
      throw new ForbiddenException('Accès refusé à ce suivi de procédure');
    }
    return tracking;
  }

  async update(
    id: number,
    userId: number,
    updateDto: UpdateProcedureTrackingDto,
  ): Promise<ProcedureTracking> {
    const tracking = await this.findOne(id, userId);

    if (updateDto.status !== undefined) {
      tracking.status = updateDto.status;
    }

    if (updateDto.completedFacts !== undefined) {
      tracking.completedFacts = updateDto.completedFacts;
    }

    if (updateDto.status === 'completed' && !tracking.end_date) {
      tracking.end_date = new Date().toISOString().split('T')[0];
    }

    // ✅ Vider end_date si l'étape est décochée
    if (
      updateDto.status === 'not_started' ||
      updateDto.status === 'in_progress'
    ) {
      tracking.end_date = null;
    }

    return await this.trackingRepository.save(tracking);
  }

  async remove(id: number, userId: number): Promise<void> {
    const tracking = await this.findOne(id, userId);
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
      // Fenêtre plus large que les 3 affichés : les exclusions (soi-même, opt-out,
      // comptes de test) ne doivent pas vider la liste alors que des buddies
      // éligibles existent juste derrière.
      take: 10,
    });

    return trackings
      .filter((t) => {
        if (t.user?.idUser === currentUserId) return false;
        if (!t.end_date) return false;
        if (t.user?.buddyOptIn === false) return false;
        if (isTestAccountEmail(t.user?.email)) return false;
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
