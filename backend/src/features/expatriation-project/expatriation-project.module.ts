import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpatriationProjectController } from './expatriation-project.controller';
import { ExpatriationProjectService } from './expatriation-project.service';
import { ExpatriationProject } from './entities/expatriation-project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExpatriationProject])],
  controllers: [ExpatriationProjectController],
  providers: [ExpatriationProjectService],
  exports: [ExpatriationProjectService],
})
export class ExpatriationProjectModule {}
