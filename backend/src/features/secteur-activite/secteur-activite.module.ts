import { Module } from '@nestjs/common';
import { SecteurActiviteService } from './secteur-activite.service';
import { SecteurActiviteController } from './secteur-activite.controller';

@Module({
  controllers: [SecteurActiviteController],
  providers: [SecteurActiviteService],
})
export class SecteurActiviteModule {}
