import { Test, TestingModule } from '@nestjs/testing';
import { PrivateMessageController } from './private-message.controller';
import { PrivateMessageService } from './private-message.service';

describe('PrivateMessageController', () => {
  let controller: PrivateMessageController;
  let service: jest.Mocked<PrivateMessageService>;

  const req = { user: { userId: 1 } };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrivateMessageController],
      providers: [
        {
          provide: PrivateMessageService,
          useValue: {
            send: jest.fn(),
            getConversations: jest.fn(),
            getUnreadCount: jest.fn(),
            getThread: jest.fn(),
            markRead: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PrivateMessageController>(PrivateMessageController);
    service = module.get(PrivateMessageService);
  });

  it('send uses the authenticated user as sender', () => {
    const dto = { recipientId: 2, content: 'hello' };
    controller.send(req, dto);
    expect(service.send).toHaveBeenCalledWith(1, 2, 'hello');
  });

  it('conversations scopes to the authenticated user', () => {
    controller.conversations(req);
    expect(service.getConversations).toHaveBeenCalledWith(1);
  });

  it('unreadCount scopes to the authenticated user', () => {
    controller.unreadCount(req);
    expect(service.getUnreadCount).toHaveBeenCalledWith(1);
  });

  it('thread fetches the exchange between the authenticated user and the target user', () => {
    controller.thread(req, 5);
    expect(service.getThread).toHaveBeenCalledWith(1, 5);
  });

  it('markRead scopes to the authenticated user', () => {
    controller.markRead(req, 9);
    expect(service.markRead).toHaveBeenCalledWith(9, 1);
  });
});
