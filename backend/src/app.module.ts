import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './config/typeorm.config';

import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { PaysModule } from './features/pays/pays.module';
import { ContinentModule } from './features/continent/continent.module';
import { VilleModule } from './features/ville/ville.module';
import { SecteurActiviteModule } from './features/secteur-activite/secteur-activite.module';
import { GuideModule } from './features/guide/guide.module';
import { ChecklistModule } from './features/checklist/checklist.module';
import { RessourceModule } from './features/ressource/ressource.module';
import { CoutVieModule } from './features/cout-vie/cout-vie.module';
import { OffreEmploiModule } from './features/offre-emploi/offre-emploi.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    AuthModule,
    UserModule,
    ContinentModule,
    PaysModule,
    VilleModule,
    SecteurActiviteModule,
    GuideModule,
    ChecklistModule,
    RessourceModule,
    CoutVieModule,
    OffreEmploiModule,
  ],
})
export class AppModule {}
