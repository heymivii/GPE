import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PrivateMessage } from './entities/private-message.entity';
import { User } from '../user/entities/user.entity';
import { ContentFilterService } from '../forum-message/content-filter.service';

@Injectable()
export class PrivateMessageService {
  constructor(
    @InjectRepository(PrivateMessage)
    private readonly repo: Repository<PrivateMessage>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly contentFilter: ContentFilterService,
  ) {}

  private displayName(u?: User | null): string {
    if (!u) return 'Utilisateur';
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ');
    return name || `Utilisateur #${u.idUser}`;
  }

  /** Envoie un message privé. L'expéditeur vient TOUJOURS du token. */
  async send(
    senderId: number,
    recipientId: number,
    content: string,
  ): Promise<PrivateMessage> {
    if (senderId === recipientId) {
      throw new BadRequestException('Vous ne pouvez pas vous écrire à vous-même.');
    }
    const recipient = await this.userRepo.findOne({
      where: { idUser: recipientId },
    });
    if (!recipient) throw new NotFoundException('Destinataire introuvable');

    const sanitized = this.contentFilter.sanitize(content);
    const check = await this.contentFilter.validate(sanitized);
    if (!check.ok) {
      throw new BadRequestException(`Message rejeté : ${check.reason}`);
    }

    const message = this.repo.create({
      senderId,
      recipientId,
      content: sanitized,
    });
    return this.repo.save(message);
  }

  /** Liste des interlocuteurs : dernier message, date, non-lus. */
  async getConversations(userId: number) {
    const messages = await this.repo.find({
      where: [{ senderId: userId }, { recipientId: userId }],
      relations: ['sender', 'recipient'],
      order: { sentAt: 'DESC' },
    });

    const byOther = new Map<
      number,
      { other: User; last: PrivateMessage; unread: number }
    >();
    for (const m of messages) {
      const isMineSent = m.senderId === userId;
      const otherId = isMineSent ? m.recipientId : m.senderId;
      const other = isMineSent ? m.recipient : m.sender;
      let entry = byOther.get(otherId);
      if (!entry) {
        // Messages triés DESC → le premier vu est le plus récent.
        entry = { other, last: m, unread: 0 };
        byOther.set(otherId, entry);
      }
      if (m.recipientId === userId && !m.readAt) entry.unread++;
    }

    return [...byOther.values()].map((e) => ({
      userId: e.other.idUser,
      fullName: this.displayName(e.other),
      lastMessage: e.last.content,
      lastAt: e.last.sentAt,
      unread: e.unread,
    }));
  }

  /** Fil complet avec un utilisateur (chronologique). Marque les reçus comme lus. */
  async getThread(userId: number, otherUserId: number) {
    const messages = await this.repo.find({
      where: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
      order: { sentAt: 'ASC' },
    });

    const unreadIds = messages
      .filter((m) => m.recipientId === userId && !m.readAt)
      .map((m) => m.idPrivateMessage);
    if (unreadIds.length) {
      await this.repo.update(unreadIds, { readAt: new Date() });
    }

    return messages.map((m) => ({
      idPrivateMessage: m.idPrivateMessage,
      senderId: m.senderId,
      recipientId: m.recipientId,
      content: m.content,
      sentAt: m.sentAt,
      mine: m.senderId === userId,
    }));
  }

  /**
   * Marque un message comme lu — SEUL le destinataire le peut.
   * Point de sécurité critique : 403 si l'appelant n'est pas le destinataire.
   */
  async markRead(messageId: number, userId: number): Promise<PrivateMessage> {
    const message = await this.repo.findOne({
      where: { idPrivateMessage: messageId },
    });
    if (!message) throw new NotFoundException('Message introuvable');
    if (message.recipientId !== userId) {
      throw new ForbiddenException(
        'Seul le destinataire peut marquer ce message comme lu.',
      );
    }
    if (!message.readAt) {
      message.readAt = new Date();
      await this.repo.save(message);
    }
    return message;
  }

  /** Nombre total de messages non lus (pastille de navigation). */
  async getUnreadCount(userId: number): Promise<{ count: number }> {
    const count = await this.repo.count({
      where: { recipientId: userId, readAt: IsNull() },
    });
    return { count };
  }
}
