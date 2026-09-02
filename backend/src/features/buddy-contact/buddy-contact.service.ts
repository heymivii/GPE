import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuddyContactRequest } from './entities/buddy-contact-request.entity';
import { NotificationService } from '../notification/notification.service';
import { AdminProcedure } from '../admin-procedure/entities/admin-procedure.entity';

@Injectable()
export class BuddyContactService {
  constructor(
    @InjectRepository(BuddyContactRequest)
    private readonly requestRepository: Repository<BuddyContactRequest>,
    @InjectRepository(AdminProcedure)
    private readonly procedureRepository: Repository<AdminProcedure>,
    private readonly notificationService: NotificationService,
  ) {}

  async sendRequest(
    senderId: number,
    recipientId: number,
    procedureId: number,
    message?: string,
  ): Promise<BuddyContactRequest> {
    if (senderId === recipientId) {
      throw new BadRequestException('Vous ne pouvez pas vous contacter vous-meme.');
    }

    const existing = await this.requestRepository.findOne({
      where: {
        sender: { idUser: senderId },
        recipient: { idUser: recipientId },
        procedure: { idAdminProcedure: procedureId },
        status: 'pending',
      },
    });
    if (existing) {
      throw new BadRequestException('Une demande de contact est deja en attente pour cette etape.');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const procedure = await this.procedureRepository.findOne({
      where: { idAdminProcedure: procedureId },
    });

    const request = this.requestRepository.create({
      sender: { idUser: senderId } as any,
      recipient: { idUser: recipientId } as any,
      procedure: { idAdminProcedure: procedureId } as any,
      message: message ?? null,
      status: 'pending',
      expiresAt,
    });

    const saved = await this.requestRepository.save(request);

    await this.notificationService.create({
      userId: recipientId,
      notificationType: 'message' as any,
      message: `Quelqu'un souhaite vous contacter a propos de "${procedure?.procedureType ?? 'une etape'}". Acceptez-vous ?`,
      contextType: 'buddy-request',
      contextId: saved.id,
    });

    return saved;
  }

  async respondToRequest(
    requestId: number,
    currentUserId: number,
    accept: boolean,
  ): Promise<BuddyContactRequest> {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
      relations: ['sender', 'recipient', 'procedure'],
    });

    if (!request) {
      throw new NotFoundException('Demande de contact introuvable.');
    }

    if (request.recipientId !== currentUserId) {
      throw new ForbiddenException("Vous n'etes pas le destinataire de cette demande.");
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Cette demande a deja ete traitee.');
    }

    if (new Date() > request.expiresAt) {
      request.status = 'expired';
      await this.requestRepository.save(request);
      throw new BadRequestException('Cette demande a expire.');
    }

    request.status = accept ? 'accepted' : 'declined';
    const updated = await this.requestRepository.save(request);

    await this.notificationService.create({
      userId: request.senderId,
      notificationType: 'message' as any,
      message: accept
        ? `${request.recipient?.firstName ?? 'Votre buddy'} a accepte votre demande de contact pour "${request.procedure?.procedureType}" !`
        : `Ce buddy n'est pas disponible pour le moment.`,
      ...(accept
        ? {
            contextType: 'user',
            contextId: request.recipientId,
            contextLabel: request.recipient?.firstName,
          }
        : {}),
    });

    return updated;
  }

  async getMyRequests(userId: number): Promise<BuddyContactRequest[]> {
    await this.requestRepository
      .createQueryBuilder()
      .update(BuddyContactRequest)
      .set({ status: 'expired' })
      .where('status = :status', { status: 'pending' })
      .andWhere('expires_at < NOW()')
      .execute();

    return this.requestRepository.find({
      where: [
        { recipient: { idUser: userId } },
        { sender: { idUser: userId } },
      ],
      relations: ['sender', 'recipient', 'procedure'],
      order: { createdAt: 'DESC' },
    });
  }
}
