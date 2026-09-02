import { Test, TestingModule } from '@nestjs/testing';
import { ForumModerationController } from './forum-moderation.controller';
import { ForumModerationService } from './forum-moderation.service';

describe('ForumModerationController', () => {
  let controller: ForumModerationController;
  let service: jest.Mocked<ForumModerationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ForumModerationController],
      providers: [
        {
          provide: ForumModerationService,
          useValue: {
            createWord: jest.fn(),
            listWords: jest.fn(),
            updateWord: jest.fn(),
            removeWord: jest.fn(),
            listFlaggedUsers: jest.fn(),
            listUserWarnings: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ForumModerationController>(
      ForumModerationController,
    );
    service = module.get(ForumModerationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('createWord delegates to the service', () => {
    const dto = { word: 'test' } as any;
    controller.createWord(dto);
    expect(service.createWord).toHaveBeenCalledWith(dto);
  });

  it('listWords delegates to the service', () => {
    controller.listWords();
    expect(service.listWords).toHaveBeenCalled();
  });

  it('updateWord delegates to the service', () => {
    const dto = { isActive: false } as any;
    controller.updateWord(1, dto);
    expect(service.updateWord).toHaveBeenCalledWith(1, dto);
  });

  it('removeWord delegates to the service', () => {
    controller.removeWord(1);
    expect(service.removeWord).toHaveBeenCalledWith(1);
  });

  describe('flaggedUsers', () => {
    it('passes undefined threshold when not provided', () => {
      controller.flaggedUsers(undefined);
      expect(service.listFlaggedUsers).toHaveBeenCalledWith(undefined);
    });

    it('parses the threshold query param as an integer', () => {
      controller.flaggedUsers('5');
      expect(service.listFlaggedUsers).toHaveBeenCalledWith(5);
    });
  });

  it('userWarnings delegates to the service', () => {
    controller.userWarnings(7);
    expect(service.listUserWarnings).toHaveBeenCalledWith(7);
  });
});
