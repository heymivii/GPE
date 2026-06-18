import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BuddyContactService } from './buddy-contact.service';
import { BuddyContactController } from './buddy-contact.controller';
import { BuddyContactRequest } from './entities/buddy-contact-request.entity';
import { AdminProcedure } from '../admin-procedure/entities/admin-procedure.entity';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BuddyContactRequest, AdminProcedure]),
    NotificationModule,
  ],
  controllers: [BuddyContactController],
  providers: [BuddyContactService],
  exports: [BuddyContactService],
})
export class BuddyContactModule {}
