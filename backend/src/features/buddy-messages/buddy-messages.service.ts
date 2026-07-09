import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BuddyMessage } from './entities/buddy-message.entity';
import { BuddyContactRequest } from '../buddy-contact/entities/buddy-contact-request.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class BuddyMessagesService {
  constructor(
    @InjectRepository(BuddyMessage)
    private readonly messageRepository: Repository<BuddyMessage>,
    @InjectRepository(BuddyContactRequest)
    private readonly contactRequestRepository: Repository<BuddyContactRequest>,
    private readonly notificationService: NotificationService,
  ) {}

  private async assertParticipant(contactRequestId: number, userId: number): Promise<BuddyContactRequest> {
    const request = await this.contactRequestRepository.findOne({
      where: { id: contactRequestId },
      relations: ['sender', 'recipient', 'procedure'],
    });

    if (!request) {
      throw new NotFoundException('Conversation introuvable.');
    }

    if (request.status !== 'accepted') {
      throw new BadRequestException('Cette conversation n\'est pas encore active.');
    }

    if (request.senderId !== userId && request.recipientId !== userId) {
      throw new ForbiddenException('Vous ne faites pas partie de cette conversation.');
    }

    return request;
  }

  async getConversations(userId: number): Promise<BuddyContactRequest[]> {
    return this.contactRequestRepository.find({
      where: [
        { senderId: userId, status: 'accepted' },
        { recipientId: userId, status: 'accepted' },
      ],
      relations: ['sender', 'recipient', 'procedure'],
      order: { createdAt: 'DESC' },
    });
  }

  async getMessages(contactRequestId: number, userId: number): Promise<BuddyMessage[]> {
    await this.assertParticipant(contactRequestId, userId);

    return this.messageRepository.find({
      where: { contactRequestId },
      relations: ['sender'],
      order: { sentAt: 'ASC' },
    });
  }

  async sendMessage(
    contactRequestId: number,
    userId: number,
    content: string,
  ): Promise<BuddyMessage> {
    const request = await this.assertParticipant(contactRequestId, userId);

    const message = this.messageRepository.create({
      content,
      contactRequest: { id: contactRequestId } as any,
      sender: { idUser: userId } as any,
    });

    const saved = await this.messageRepository.save(message);

    const recipientId = request.senderId === userId ? request.recipientId : request.senderId;

    await this.notificationService.create({
      userId: recipientId,
      notificationType: 'message' as any,
      message: `Nouveau message a propos de "${request.procedure?.procedureType ?? 'votre conversation'}".`,
    });

    return saved;
  }

  async markAsRead(contactRequestId: number, userId: number): Promise<void> {
    await this.assertParticipant(contactRequestId, userId);

    await this.messageRepository
      .createQueryBuilder()
      .update(BuddyMessage)
      .set({ isRead: true })
      .where('contact_request_id = :contactRequestId', { contactRequestId })
      .andWhere('sender_id != :userId', { userId })
      .execute();
  }
}
