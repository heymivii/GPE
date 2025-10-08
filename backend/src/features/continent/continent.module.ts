import { Module } from '@nestjs/common';
import { ContinentService } from './continent.service';
import { ContinentController } from './continent.controller';

@Module({
  controllers: [ContinentController],
  providers: [ContinentService],
})
export class ContinentModule {}
