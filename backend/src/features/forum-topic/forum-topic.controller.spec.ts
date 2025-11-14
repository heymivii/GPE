import { Test, TestingModule } from '@nestjs/testing';
import { ForumTopicController } from './forum-topic.controller';
import { ForumTopicService } from './forum-topic.service';

describe('ForumTopicController', () => {
  let controller: ForumTopicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumTopicController],
      providers: [ForumTopicService],
    }).compile();

    controller = module.get<ForumTopicController>(ForumTopicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
