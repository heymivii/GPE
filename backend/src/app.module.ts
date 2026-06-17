import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { typeOrmConfigAsync } from './config/typeorm.config';

import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { CostOfLivingModule } from './features/cost-of-living/cost-of-living.module';
import { PropertyInvestmentModule } from './features/property-investment/property-investment.module';
import { ResourceModule } from './features/resource/resource.module';
import { BusinessSectorModule } from './features/business-sector/business-sector.module';
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
import { ExperienceModule } from './features/experience/experience.module';
import { JobOfferModule } from './features/job-offer/job-offer.module';
import { CityComparisonModule } from './features/city-comparison/city-comparison.module';
import { ExpatriationProjectModule } from './features/expatriation-project/expatriation-project.module';
import { DestinationsModule } from './features/destinations/destinations.module';
import { GlobalSearchModule } from './features/global-search/global-search.module';
import { OecdMigrationModule } from './features/oecd-migration/oecd-migration.module';
import { NewsletterModule } from './features/newsletter/newsletter.module';
import { VisaRequirementModule } from './features/project/visa/visa-requirement.module';
import { TravelTypeModule } from './features/project/travel-type/travel-type.module';

import { AdminStatsModule } from './features/admin-stats/admin-stats.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
    }),

    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),

    TypeOrmModule.forRootAsync(typeOrmConfigAsync),

    AuthModule,
    UserModule,
    ContinentModule,
    CountryModule,
    CityModule,
    CityComparisonModule,
    BusinessSectorModule,
    GuideModule,
    ChecklistModule,
    ResourceModule,
    CostOfLivingModule,
    PropertyInvestmentModule,
    JobOfferModule,
    AdminProcedureModule,
    ProcedureTrackingModule,
    ForumTopicModule,
    ForumMessageModule,
    NotificationModule,
    ExperienceModule,
    ExpatriationProjectModule,
    DestinationsModule,
    GlobalSearchModule,
    OecdMigrationModule,
    NewsletterModule,
    VisaRequirementModule,
    TravelTypeModule,
    AdminStatsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule { }
