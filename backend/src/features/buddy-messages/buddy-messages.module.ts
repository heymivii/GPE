import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuddyMessagesService } from './buddy-messages.service';
import { BuddyMessagesController } from './buddy-messages.controller';
import { BuddyMessage } from './entities/buddy-message.entity';
import { BuddyContactRequest } from '../buddy-contact/entities/buddy-contact-request.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuddyMessage, BuddyContactRequest]),
    NotificationModule,
  ],
  controllers: [BuddyMessagesController],
  providers: [BuddyMessagesService],
  exports: [BuddyMessagesService],
})
export class BuddyMessagesModule {}
