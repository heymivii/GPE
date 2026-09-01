import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportRating } from './entities/support-rating.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';

export interface RatingSummary {
  average: number;
  count: number;
}

@Injectable()
export class SupportRatingService {
  constructor(
    @InjectRepository(SupportRating)
    private readonly ratingRepo: Repository<SupportRating>,
    @InjectRepository(ForumMessage)
    private readonly messageRepo: Repository<ForumMessage>,
  ) {}

  /** Note (ou re-note) le message d'un autre utilisateur. */
  async rate(
    raterId: number,
    messageId: number,
    stars: number,
    comment?: string,
  ): Promise<SupportRating> {
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      throw new BadRequestException('La note doit être un entier entre 1 et 5.');
    }
    const message = await this.messageRepo.findOne({
      where: { idForumMessage: messageId },
      relations: ['user'],
    });
    if (!message) throw new NotFoundException('Message introuvable');

    const authorId = message.user?.idUser;
    if (authorId === raterId) {
      throw new BadRequestException('Vous ne pouvez pas noter votre propre message.');
    }

    // Unicité (rater, message) → on met à jour si déjà noté.
    const existing = await this.ratingRepo.findOne({
      where: { raterId, messageId },
    });
    if (existing) {
      existing.stars = stars;
      existing.comment = comment ?? null;
      return this.ratingRepo.save(existing);
    }
    const rating = this.ratingRepo.create({
      raterId,
      ratedUserId: authorId,
      messageId,
      stars,
      comment: comment ?? null,
    });
    return this.ratingRepo.save(rating);
  }

  /** Retire sa propre note d'un message. */
  async unrate(raterId: number, messageId: number): Promise<void> {
    await this.ratingRepo.delete({ raterId, messageId });
  }

  /** Note moyenne + nombre d'avis reçus par un utilisateur. */
  async getUserRating(userId: number): Promise<RatingSummary> {
    const raw = await this.ratingRepo
      .createQueryBuilder('r')
      .select('AVG(r.stars)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.rated_user_id = :userId', { userId })
      .getRawOne<{ avg: string | null; count: string }>();
    const count = parseInt(raw?.count ?? '0', 10);
    const average = raw?.avg ? Math.round(parseFloat(raw.avg) * 10) / 10 : 0;
    return { average, count };
  }

  /** Résumés de notes pour plusieurs utilisateurs (annuaire experts) — 1 requête. */
  async getRatingsForUsers(
    userIds: number[],
  ): Promise<Map<number, RatingSummary>> {
    const map = new Map<number, RatingSummary>();
    if (userIds.length === 0) return map;
    const rows = await this.ratingRepo
      .createQueryBuilder('r')
      .select('r.rated_user_id', 'userId')
      .addSelect('AVG(r.stars)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('r.rated_user_id IN (:...userIds)', { userIds })
      .groupBy('r.rated_user_id')
      .getRawMany<{ userId: number; avg: string; count: string }>();
    for (const row of rows) {
      map.set(Number(row.userId), {
        average: Math.round(parseFloat(row.avg) * 10) / 10,
        count: parseInt(row.count, 10),
      });
    }
    return map;
  }

  /** Les notes de l'utilisateur courant pour les messages d'un topic (hydratation UI). */
  async getMyRatingsForTopic(
    raterId: number,
    topicId: number,
  ): Promise<{ messageId: number; stars: number }[]> {
    const rows = await this.ratingRepo
      .createQueryBuilder('r')
      .innerJoin('r.message', 'm')
      .where('r.rater_id = :raterId', { raterId })
      .andWhere('m.topic_id = :topicId', { topicId })
      .select(['r.message_id AS "messageId"', 'r.stars AS stars'])
      .getRawMany<{ messageId: number; stars: number }>();
    return rows.map((row) => ({
      messageId: Number(row.messageId),
      stars: Number(row.stars),
    }));
  }
}
