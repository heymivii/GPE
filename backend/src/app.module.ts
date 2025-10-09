import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './config/typeorm.config';

import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { CostOfLivingModule } from './features/cost-of-living/cost-of-living.module';
import { ResourceModule } from './features/resource/resource.module';
import { IndustrySectorModule } from './features/industry-sector/industry-sector.module';
import { CityModule } from './features/city/city.module';
import { CountryModule } from './features/country/country.module';
import { GuideModule } from './features/guide/guide.module';
import { ChecklistModule } from './features/checklist/checklist.module';
import { ContinentModule } from './features/continent/continent.module';
import { AdminProcedureModule } from './features/admin-procedure/admin-procedure.module';
import { ProcedureTrackingModule } from './features/procedure-tracking/procedure-tracking.module';
import { ForumTopicModule } from './features/forum-topic/forum-topic.module';
import { ForumMessageModule } from './features/forum-message/forum-message.module';
import { NotificationModule } from './features/notification/notification.module';
import { JobOffer } from './features/job-offer/entities/job-offer.entity';
import { Experience } from './features/experience/entities/experience.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    AuthModule,
    UserModule,
    ContinentModule,
    GuideModule,
    ChecklistModule,
    CountryModule,
    CityModule,
    IndustrySectorModule,
    ResourceModule,
    CostOfLivingModule,
    AdminProcedureModule,
    ProcedureTrackingModule,
    ForumTopicModule,
    ForumMessageModule,
    NotificationModule,
    JobOffer,
    Experience
  ],
})
export class AppModule {}
