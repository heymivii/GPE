import { Module } from '@nestjs/common';
import { OffreEmploiService } from './offre-emploi.service';
import { OffreEmploiController } from './offre-emploi.controller';

@Module({
  controllers: [OffreEmploiController],
  providers: [OffreEmploiService],
})
export class OffreEmploiModule {}
