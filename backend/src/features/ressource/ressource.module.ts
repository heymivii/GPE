import { Module } from '@nestjs/common';
import { RessourceService } from './ressource.service';
import { RessourceController } from './ressource.controller';

@Module({
  controllers: [RessourceController],
  providers: [RessourceService],
})
export class RessourceModule {}
