import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SupportRatingService } from './support-rating.service';
import { SupportRating } from './entities/support-rating.entity';
import { ForumMessage } from '../forum-message/entities/forum-message.entity';

const mockRatingRepo = () => ({
  create: jest.fn((v) => v),
  save: jest.fn((v) => Promise.resolve(v)),
  findOne: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(),
});

const mockMessageRepo = () => ({
  findOne: jest.fn(),
});

describe('SupportRatingService', () => {
  let service: SupportRatingService;
  let ratingRepo: ReturnType<typeof mockRatingRepo>;
  let messageRepo: ReturnType<typeof mockMessageRepo>;

  beforeEach(async () => {
    ratingRepo = mockRatingRepo();
    messageRepo = mockMessageRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupportRatingService,
        { provide: getRepositoryToken(SupportRating), useValue: ratingRepo },
        { provide: getRepositoryToken(ForumMessage), useValue: messageRepo },
      ],
    }).compile();

    service = module.get<SupportRatingService>(SupportRatingService);
  });

  describe('rate()', () => {
    it('creates a rating crediting the message author', async () => {
      messageRepo.findOne.mockResolvedValue({
        idForumMessage: 10,
        user: { idUser: 2 },
      });
      ratingRepo.findOne.mockResolvedValue(null);

      const res = await service.rate(1, 10, 4, 'merci');
      expect(ratingRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          raterId: 1,
          ratedUserId: 2,
          messageId: 10,
          stars: 4,
        }),
      );
      expect(res.stars).toBe(4);
    });

    it('UPDATES the existing rating instead of duplicating (unicité)', async () => {
      messageRepo.findOne.mockResolvedValue({
        idForumMessage: 10,
        user: { idUser: 2 },
      });
      ratingRepo.findOne.mockResolvedValue({ idSupportRating: 7, stars: 2 });

      await service.rate(1, 10, 5);
      expect(ratingRepo.create).not.toHaveBeenCalled();
      expect(ratingRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ idSupportRating: 7, stars: 5 }),
      );
    });

    it('rejects rating your OWN message (400)', async () => {
      messageRepo.findOne.mockResolvedValue({
        idForumMessage: 10,
        user: { idUser: 1 },
      });
      await expect(service.rate(1, 10, 5)).rejects.toThrow(BadRequestException);
    });

    it('rejects out-of-range stars (400)', async () => {
      await expect(service.rate(1, 10, 6)).rejects.toThrow(BadRequestException);
      await expect(service.rate(1, 10, 0)).rejects.toThrow(BadRequestException);
    });

    it('throws NotFound when the message does not exist', async () => {
      messageRepo.findOne.mockResolvedValue(null);
      await expect(service.rate(1, 999, 5)).rejects.toThrow(NotFoundException);
    });
  });

  describe('unrate()', () => {
    it('deletes the rater’s own rating', async () => {
      ratingRepo.delete.mockResolvedValue({ affected: 1 });
      await service.unrate(1, 10);
      expect(ratingRepo.delete).toHaveBeenCalledWith({ raterId: 1, messageId: 10 });
    });
  });

  describe('getUserRating()', () => {
    it('returns rounded average + count', async () => {
      ratingRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: '4.333', count: '3' }),
      });

      const res = await service.getUserRating(2);
      expect(res).toEqual({ average: 4.3, count: 3 });
    });

    it('returns zeros when the user has no ratings', async () => {
      ratingRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ avg: null, count: '0' }),
      });
      expect(await service.getUserRating(2)).toEqual({ average: 0, count: 0 });
    });
  });
});
