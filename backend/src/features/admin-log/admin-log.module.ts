import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminLog } from './entities/admin-log.entity';
import { AdminLogService } from './admin-log.service';
import { AdminLogController } from './admin-log.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AdminLog])],
  controllers: [AdminLogController],
  providers: [AdminLogService],
  exports: [AdminLogService],
})
export class AdminLogModule {}
