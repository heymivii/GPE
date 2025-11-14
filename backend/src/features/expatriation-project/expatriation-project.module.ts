import { Module } from '@nestjs/common';
import { ExpatriationProjectController } from './expatriation-project.controller';
import { ExpatriationProjectService } from './expatriation-project.service';

@Module({
  controllers: [ExpatriationProjectController],
  providers: [ExpatriationProjectService]
})
export class ExpatriationProjectModule {}
