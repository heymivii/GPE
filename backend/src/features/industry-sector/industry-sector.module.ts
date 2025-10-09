import { Module } from '@nestjs/common';
import { IndustrySectorService } from './industry-sector.service';
import { IndustrySectorController } from './industry-sector.controller';

@Module({
  controllers: [IndustrySectorController],
  providers: [IndustrySectorService],
})
export class IndustrySectorModule {}
