import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHint } from './entities/search-hint.entity';
import { SearchHintService } from './search-hint.service';

@Module({
  imports: [TypeOrmModule.forFeature([SearchHint])],
  providers: [SearchHintService],
  // Exported so the gov-links engine (Prompt B) can consume the address book.
  exports: [SearchHintService, TypeOrmModule],
})
export class SearchHintModule {}
