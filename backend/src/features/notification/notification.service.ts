import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  // Recipient is createDto.userId — the review workflow legitimately notifies OTHER
  // users. The public POST route (controller) forces this to the caller to stop spoofing.
  async create(createDto: CreateNotificationDto): Promise<Notification> {
    const notification = this.notificationRepository.create({
      notifType: createDto.notificationType ?? 'info',
      message: createDto.message,
      user: { idUser: createDto.userId } as any,
    });
    return await this.notificationRepository.save(notification);
  }

  async findAllByUser(userId: number): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { user: { idUser: userId } },
      order: { sentAt: 'DESC' },
    });
  }

  // userId requis : on ne renvoie/altère jamais la notification d'un autre utilisateur.
  async findOne(id: number, userId: number): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { idNotification: id },
      relations: ['user'],
    });
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }
    if (notification.user?.idUser !== userId) {
      throw new ForbiddenException('Accès refusé à cette notification');
    }
    return notification;
  }

  async markAsRead(id: number, userId: number): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    notification.isRead = true;
    return await this.notificationRepository.save(notification);
  }

  async update(
    id: number,
    userId: number,
    updateDto: UpdateNotificationDto,
  ): Promise<Notification> {
    const notification = await this.findOne(id, userId);
    Object.assign(notification, updateDto);
    return await this.notificationRepository.save(notification);
  }

  async remove(id: number, userId: number): Promise<void> {
    const notification = await this.findOne(id, userId);
    await this.notificationRepository.remove(notification);
  }
}
