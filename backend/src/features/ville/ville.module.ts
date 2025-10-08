import { Module } from '@nestjs/common';
import { VilleService } from './ville.service';
import { VilleController } from './ville.controller';

@Module({
  controllers: [VilleController],
  providers: [VilleService],
})
export class VilleModule {}
