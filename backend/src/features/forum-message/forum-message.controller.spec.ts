import { Test, TestingModule } from '@nestjs/testing';
import { ForumMessageController } from './forum-message.controller';
import { ForumMessageService } from './forum-message.service';

describe('ForumMessageController', () => {
  let controller: ForumMessageController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumMessageController],
      providers: [ForumMessageService],
    }).compile();

    controller = module.get<ForumMessageController>(ForumMessageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
