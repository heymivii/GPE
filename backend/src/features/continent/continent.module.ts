import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContinentController } from './continent.controller';
import { ContinentService } from './continent.service';
import { Continent } from './entities/continent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Continent])],
  controllers: [ContinentController],
  providers: [ContinentService],
  exports: [ContinentService],
})
export class ContinentModule {}
