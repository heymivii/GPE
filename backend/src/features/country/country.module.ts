import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { Continent } from '../continent/entities/continent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Country, Continent])],
  providers: [CountryService],
  controllers: [CountryController],
  exports: [CountryService],
})
export class CountryModule {}
