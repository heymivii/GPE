import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpertApplication } from './entities/expert-application.entity';
import { ExpertApplicationService } from './expert-application.service';
import { ExpertApplicationController } from './expert-application.controller';
import { DocumentStorageService } from '../document/document-storage.service';
import { UserModule } from '../user/user.module';
import { AdminLogModule } from '../admin-log/admin-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpertApplication]),
    UserModule,
    AdminLogModule,
  ],
  controllers: [ExpertApplicationController],
  // DocumentStorageService est fourni ici aussi : il est sans état (clé + dossier),
  // deux instances écrivent dans le même répertoire chiffré.
  providers: [ExpertApplicationService, DocumentStorageService],
  exports: [ExpertApplicationService],
})
export class ExpertApplicationModule {}
