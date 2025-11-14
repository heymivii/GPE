import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessSectorController } from './business-sector.controller';
import { BusinessSectorService } from './business-sector.service';
import { BusinessSector } from './entities/business-sector.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessSector])],
  controllers: [BusinessSectorController],
  providers: [BusinessSectorService],
  exports: [BusinessSectorService],
})
export class BusinessSectorModule {}
