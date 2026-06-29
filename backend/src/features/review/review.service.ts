import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { CreateNotificationDto } from '../notification/dto/create-notification.dto';

/**
 * Shared content-review workflow: anything an admin adds (country, city, …) must be
 * verified by ANOTHER admin before going live ("4 eyes" rule).
 *   - on create → every OTHER admin gets a notification asking for review,
 *   - on approve/reject → the author gets notified of the decision,
 *   - the author can never validate their own addition.
 */
@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly notifications: NotificationService,
  ) {}

  /** "4 eyes": the author of an addition cannot approve/reject it themselves. */
  assertNotSelfReview(
    createdById: number | null | undefined,
    reviewerId: number,
  ): void {
    if (createdById != null && createdById === reviewerId) {
      throw new ForbiddenException(
        'Règle des 4 yeux : vous ne pouvez pas valider votre propre ajout — un autre admin doit le vérifier.',
      );
    }
  }

  /** Notify every admin EXCEPT the author that a new item awaits review. */
  async notifyAdminsOfPending(
    entityLabel: string, // e.g. `Pays « Canada »`
    authorId?: number | null,
  ): Promise<void> {
    try {
      const [admins, authorName] = await Promise.all([
        this.users.find({ where: { roles: 'admin' } }),
        this.displayName(authorId),
      ]);
      await Promise.all(
        admins
          .filter((a) => a.idUser !== authorId)
          .map((a) =>
            this.notifications.create({
              userId: a.idUser,
              notificationType: 'alert',
              message: `🔍 ${entityLabel} ajouté par ${authorName} — vérification requise avant publication.`,
            } as CreateNotificationDto),
          ),
      );
    } catch (e) {
      // Notifications must never break the actual creation.
      this.logger.warn(
        `notifyAdminsOfPending failed: ${(e as Error)?.message}`,
      );
    }
  }

  /** Simple awareness ping (no approval needed): tell the other admins something was added. */
  async notifyAdminsOfAddition(
    entityLabel: string,
    authorId?: number | null,
  ): Promise<void> {
    try {
      const [admins, authorName] = await Promise.all([
        this.users.find({ where: { roles: 'admin' } }),
        this.displayName(authorId),
      ]);
      await Promise.all(
        admins
          .filter((a) => a.idUser !== authorId)
          .map((a) =>
            this.notifications.create({
              userId: a.idUser,
              notificationType: 'info',
              message: `ℹ️ ${entityLabel} ajouté par ${authorName} — visible côté utilisateur.`,
            } as CreateNotificationDto),
          ),
      );
    } catch (e) {
      this.logger.warn(
        `notifyAdminsOfAddition failed: ${(e as Error)?.message}`,
      );
    }
  }

  /** Notify the author that their addition was approved or rejected. */
  async notifyAuthorOfDecision(
    entityLabel: string,
    authorId: number | null | undefined,
    approved: boolean,
    reviewerId: number,
  ): Promise<void> {
    if (authorId == null) return;
    try {
      const reviewerName = await this.displayName(reviewerId);
      await this.notifications.create({
        userId: authorId,
        notificationType: 'info',
        message: approved
          ? `✅ ${entityLabel} a été vérifié et publié par ${reviewerName}.`
          : `❌ ${entityLabel} a été rejeté par ${reviewerName} — il n'est pas publié.`,
      } as CreateNotificationDto);
    } catch (e) {
      this.logger.warn(
        `notifyAuthorOfDecision failed: ${(e as Error)?.message}`,
      );
    }
  }

  /** Generic single-user notification (assignment workflow etc.). Never throws. */
  async notifyUser(
    userId: number | null | undefined,
    message: string,
    type: 'info' | 'alert' = 'info',
  ): Promise<void> {
    if (userId == null) return;
    try {
      await this.notifications.create({
        userId,
        notificationType: type,
        message,
      } as CreateNotificationDto);
    } catch (e) {
      this.logger.warn(`notifyUser failed: ${(e as Error)?.message}`);
    }
  }

  /** Public helper for workflow messages. */
  async nameOf(userId?: number | null): Promise<string> {
    return this.displayName(userId);
  }

  private async displayName(userId?: number | null): Promise<string> {
    if (userId == null) return 'un admin';
    const u = await this.users.findOne({ where: { idUser: userId } });
    if (!u) return 'un admin';
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim();
    return name || u.email || 'un admin';
  }
}
