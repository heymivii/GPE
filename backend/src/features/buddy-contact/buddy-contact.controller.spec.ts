import { Test, TestingModule } from '@nestjs/testing';
import { BuddyContactController } from './buddy-contact.controller';
import { BuddyContactService } from './buddy-contact.service';

const mockService = () => ({
  sendRequest: jest.fn(),
  respondToRequest: jest.fn(),
  getMyRequests: jest.fn(),
});

describe('BuddyContactController', () => {
  let controller: BuddyContactController;
  let service: ReturnType<typeof mockService>;

  beforeEach(async () => {
    service = mockService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuddyContactController],
      providers: [{ provide: BuddyContactService, useValue: service }],
    }).compile();

    controller = module.get<BuddyContactController>(BuddyContactController);
  });

  const req = { user: { userId: 2 } } as any;

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendRequest()', () => {
    it('delegates to service.sendRequest() with the sender id from the request', () => {
      controller.sendRequest(req, { recipientId: 5, procedureId: 9, message: 'Hey' });
      expect(service.sendRequest).toHaveBeenCalledWith(2, 5, 9, 'Hey');
    });
  });

  describe('respondToRequest()', () => {
    it('delegates to service.respondToRequest() with the responder id from the request', () => {
      controller.respondToRequest(6, req, { accept: true });
      expect(service.respondToRequest).toHaveBeenCalledWith(6, 2, true);
    });
  });

  describe('getMyRequests()', () => {
    it('delegates to service.getMyRequests() with the current user id', () => {
      controller.getMyRequests(req);
      expect(service.getMyRequests).toHaveBeenCalledWith(2);
    });
  });
});
