import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProcedureService } from './admin-procedure.service';
import { AdminProcedureGeneratorService } from './admin-procedure-generator.service';
import { AdminProcedureController } from './admin-procedure.controller';
import { AdminProcedure } from './entities/admin-procedure.entity';
import { GovLink } from '../gov-links/entities/gov-link.entity';
import { Country } from '../country/entities/country.entity';
import { AdminLogModule } from '../admin-log/admin-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminProcedure, GovLink, Country]),
    AdminLogModule,
  ],
  controllers: [AdminProcedureController],
  providers: [AdminProcedureService, AdminProcedureGeneratorService],
  exports: [AdminProcedureService, AdminProcedureGeneratorService],
})
export class AdminProcedureModule {}
