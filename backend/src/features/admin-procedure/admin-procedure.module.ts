import { Module } from '@nestjs/common';
import { AdminProcedureService } from './admin-procedure.service';
import { AdminProcedureController } from './admin-procedure.controller';

@Module({
  controllers: [AdminProcedureController],
  providers: [AdminProcedureService],
})
export class AdminProcedureModule {}
