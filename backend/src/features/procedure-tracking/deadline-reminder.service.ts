import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { ProcedureTracking } from './entities/procedure-tracking.entity';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';

// Paliers de rappel (jours avant l'échéance d'une étape), du plus lointain au plus proche.
const MILESTONES = [30, 7];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

@Injectable()
export class DeadlineReminderService {
  private readonly logger = new Logger(DeadlineReminderService.name);

  constructor(
    @InjectRepository(ProcedureTracking)
    private readonly trackingRepo: Repository<ProcedureTracking>,
    private readonly notifications: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleCron(): Promise<void> {
    const sent = await this.runReminders();
    if (sent > 0) {
      this.logger.log(`⏰ ${sent} rappel(s) d'échéance envoyé(s)`);
    }
  }

  /**
   * Parcourt les étapes non terminées et envoie une notification aux paliers J-30 puis J-7
   * avant leur échéance (date de départ − daysBeforeDeparture). Idempotent via lastReminderDays.
   * Retourne le nombre de rappels envoyés.
   */
  async runReminders(now: Date = new Date()): Promise<number> {
    const trackings = await this.trackingRepo.find({
      where: { status: Not('completed') },
      relations: ['user', 'admin_procedure', 'project'],
    });

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    let sent = 0;

    for (const tr of trackings) {
      const dep = tr.project?.expectedDepartureDate;
      const dbd = tr.admin_procedure?.daysBeforeDeparture;
      const projectStatus = tr.project?.status;

      if (!dep || dbd == null) continue;
      if (projectStatus !== 'planning' && projectStatus !== 'active') continue;

      const deadline = new Date(dep);
      deadline.setDate(deadline.getDate() - dbd);
      const daysLeft = Math.ceil(
        (deadline.getTime() - startOfToday.getTime()) / MS_PER_DAY,
      );
      if (daysLeft <= 0) continue; // dépassé → traité par l'UI « en retard »

      // Le plus petit palier atteint et pas encore envoyé (30 d'abord, puis 7).
      const already = tr.lastReminderDays ?? Number.POSITIVE_INFINITY;
      const milestone = MILESTONES.find((m) => daysLeft <= m && m < already);
      if (milestone == null) continue;

      try {
        await this.notifications.create({
          userId: tr.user.idUser,
          notificationType: 'reminder',
          message: `⏰ J-${daysLeft} — « ${tr.admin_procedure.procedureType} » à préparer avant votre départ.`,
          // Cliquable → checklist du projet concerné.
          contextType: 'project',
          contextId: tr.project?.idProject,
        } as CreateNotificationDto);
        tr.lastReminderDays = milestone;
        await this.trackingRepo.save(tr);
        sent++;
      } catch (e) {
        this.logger.warn(
          `Rappel échoué pour le suivi ${tr.idProcedureTracking}: ${e}`,
        );
      }
    }

    return sent;
  }
}
