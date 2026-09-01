import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHint } from './entities/search-hint.entity';
import { SearchHintService } from './search-hint.service';
import { SearchHintController } from './search-hint.controller';
import { AdminLogModule } from '../admin-log/admin-log.module';

@Module({
  imports: [TypeOrmModule.forFeature([SearchHint]), AdminLogModule],
  controllers: [SearchHintController],
  providers: [SearchHintService],
  // Exported so the gov-links engine (Prompt B) can consume the address book.
  exports: [SearchHintService, TypeOrmModule],
})
export class SearchHintModule {}
