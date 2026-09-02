import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpatriationProjectController } from './expatriation-project.controller';
import { ExpatriationProjectService } from './expatriation-project.service';
import { ExpatriationProject } from './entities/expatriation-project.entity';
import { User } from '../user/entities/user.entity';

@Module({
  // `User` : lecture seule du pays d'origine (profil) pour refuser un projet
  // dont la destination est le pays de départ.
  imports: [TypeOrmModule.forFeature([ExpatriationProject, User])],
  controllers: [ExpatriationProjectController],
  providers: [ExpatriationProjectService],
  exports: [ExpatriationProjectService],
})
export class ExpatriationProjectModule {}
