import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Continent } from './entities/continent.entity';
import { ContinentService } from './continent.service';
import { ContinentController } from './continent.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Continent])],
  providers: [ContinentService],
  controllers: [ContinentController],
  exports: [ContinentService],
})
export class ContinentModule {}
