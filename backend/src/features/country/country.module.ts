import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { Country } from './entities/country.entity';
import { CountryContent } from './entities/country-content.entity';
import { CountryContentService } from './country-content.service';
import { AdminLogModule } from '../admin-log/admin-log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country, CountryContent]),
    AdminLogModule,
  ],
  controllers: [CountryController],
  providers: [CountryService, CountryContentService],
  exports: [CountryService, CountryContentService],
})
export class CountryModule {}

