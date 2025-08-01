import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './features/auth/auth.module';
import { UserModule } from './features/user/user.module';
import { User } from './features/user/entities/user.entity';
import { ContinentModule } from './features/continent/continent.module';
import { Continent } from './features/continent/entities/continent.entity';
import { Country } from './features/country/entities/country.entity';
import { CountryModule } from './features/country/country.module';
import { CityModule } from './features/city/city.module';
import { City } from './features/city/entities/city.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'postgres',
      database: process.env.DB_NAME || 'skywalk_db',
      entities: [User, Continent, Country, City],
      synchronize: true,
      autoLoadEntities: true,
    }),
    AuthModule,
    UserModule,
    ContinentModule,
    CountryModule,
    CityModule,
  ],
})
export class AppModule {}
