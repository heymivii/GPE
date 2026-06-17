import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GovLinksController } from './gov-links.controller';
import { GovLinksService, SEARCH_PROVIDER, LLM_RANKER } from './gov-links.service';
import { GovLink } from './entities/gov-link.entity';
import { LinkVerifier } from './link-verifier';
import { LocalPageReader, JinaPageReader } from './page-reader';
import { SearxngSearchProvider, TavilySearchProvider } from './search-provider';
import { OllamaRanker } from './llm-ranker';

@Module({
  imports: [TypeOrmModule.forFeature([GovLink])],
  controllers: [GovLinksController],
  providers: [
    GovLinksService,
    {
      // Clean-content reader for relevance + LLM input. Free local default; PAGE_READER=jina uses r.jina.ai (free, keyless).
      provide: LinkVerifier,
      useFactory: () =>
        new LinkVerifier(undefined, process.env.PAGE_READER === 'jina' ? new JinaPageReader() : new LocalPageReader()),
    },
    // Free SearXNG by default; set SEARCH_PROVIDER=tavily (+ TAVILY_API_KEY) in prod.
    {
      provide: SEARCH_PROVIDER,
      useFactory: () =>
        process.env.SEARCH_PROVIDER === 'tavily'
          ? new TavilySearchProvider()
          : new SearxngSearchProvider(),
    },
    { provide: LLM_RANKER, useFactory: () => new OllamaRanker() },
  ],
})
export class GovLinksModule {}
