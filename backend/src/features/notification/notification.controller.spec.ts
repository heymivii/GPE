import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';

const mockService = () => ({
  create: jest.fn(),
  findAllByUser: jest.fn(),
  findOne: jest.fn(),
  markAllAsRead: jest.fn(),
  markAsRead: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

describe('NotificationController', () => {
  let controller: NotificationController;
  let service: ReturnType<typeof mockService>;

  const req = { user: { userId: 7 } } as any;

  beforeEach(async () => {
    service = mockService();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [
        {
          provide: NotificationService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<NotificationController>(NotificationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should force the recipient to the authenticated user', () => {
      controller.create(req, { userId: 999, message: 'hi' } as any);
      expect(service.create).toHaveBeenCalledWith({
        userId: 7,
        message: 'hi',
      });
    });
  });

  describe('findAll()', () => {
    it('should delegate to service.findAllByUser() with the authenticated user id', () => {
      controller.findAll(req);
      expect(service.findAllByUser).toHaveBeenCalledWith(7);
    });
  });

  describe('findOne()', () => {
    it('should delegate to service.findOne() with a numeric id and the user id', () => {
      controller.findOne(req, '1');
      expect(service.findOne).toHaveBeenCalledWith(1, 7);
    });
  });

  describe('markAllAsRead()', () => {
    it('should delegate to service.markAllAsRead() with the authenticated user id', () => {
      controller.markAllAsRead(req);
      expect(service.markAllAsRead).toHaveBeenCalledWith(7);
    });
  });

  describe('markAsRead()', () => {
    it('should delegate to service.markAsRead() with a numeric id and the user id', () => {
      controller.markAsRead(req, '1');
      expect(service.markAsRead).toHaveBeenCalledWith(1, 7);
    });
  });

  describe('update()', () => {
    it('should delegate to service.update() with a numeric id, user id and dto', () => {
      controller.update(req, '1', { message: 'new' } as any);
      expect(service.update).toHaveBeenCalledWith(1, 7, { message: 'new' });
    });
  });

  describe('remove()', () => {
    it('should delegate to service.remove() with a numeric id and the user id', () => {
      controller.remove(req, '1');
      expect(service.remove).toHaveBeenCalledWith(1, 7);
    });
  });
});
