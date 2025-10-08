import { Module } from '@nestjs/common';
import { CoutVieService } from './cout-vie.service';
import { CoutVieController } from './cout-vie.controller';

@Module({
  controllers: [CoutVieController],
  providers: [CoutVieService],
})
export class CoutVieModule {}
