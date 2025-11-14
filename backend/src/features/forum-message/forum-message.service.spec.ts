import { Test, TestingModule } from '@nestjs/testing';
import { ForumMessageService } from './forum-message.service';

describe('ForumMessageService', () => {
  let service: ForumMessageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ForumMessageService],
    }).compile();

    service = module.get<ForumMessageService>(ForumMessageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
