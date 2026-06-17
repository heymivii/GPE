import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { Resource } from './entities/resource.entity';
import { AdminLogModule } from '../admin-log/admin-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Resource]), AdminLogModule],
  controllers: [ResourceController],
  providers: [ResourceService],
  exports: [ResourceService],
})
export class ResourceModule {}

