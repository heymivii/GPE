import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovLinksController } from './gov-links.controller';
import { GovLinksService } from './gov-links.service';
import { GovLink } from './entities/gov-link.entity';
import { LinkVerifier } from './link-verifier';
import { TavilySearchProvider } from './search-provider';
import { OllamaRanker } from './llm-ranker';

@Module({
  imports: [TypeOrmModule.forFeature([GovLink])],
  controllers: [GovLinksController],
  providers: [GovLinksService, LinkVerifier, TavilySearchProvider, OllamaRanker],
})
export class GovLinksModule {}
