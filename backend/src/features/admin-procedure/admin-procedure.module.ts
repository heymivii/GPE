import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminProcedureService } from './admin-procedure.service';
import { AdminProcedureController } from './admin-procedure.controller';
import { AdminProcedure } from './entities/admin-procedure.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminProcedure])],
  controllers: [AdminProcedureController],
  providers: [AdminProcedureService],
  exports: [AdminProcedureService],
})
export class AdminProcedureModule {}
