import { Test, TestingModule } from '@nestjs/testing';
import { ForumTopicService } from './forum-topic.service';

describe('ForumTopicService', () => {
  let service: ForumTopicService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForumTopicService],
    }).compile();

    service = module.get<ForumTopicService>(ForumTopicService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
