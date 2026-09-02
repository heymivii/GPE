import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NewsletterService } from './newsletter.service';
import {
  NewsletterSubscriber,
  SubscriptionStatus,
} from './entities/newsletter-subscriber.entity';

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('NewsletterService', () => {
  let service: NewsletterService;
  let repo: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsletterService,
        {
          provide: getRepositoryToken(NewsletterSubscriber),
          useFactory: mockRepo,
        },
      ],
    }).compile();

    service = module.get<NewsletterService>(NewsletterService);
    repo = module.get(getRepositoryToken(NewsletterSubscriber));
    jest.clearAllMocks();
  });

  it('normalizes the email (lowercase, trimmed) before lookup and creation', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockImplementation((s: any) => s);
    repo.save.mockImplementation((s: any) => Promise.resolve(s));

    await service.subscribe({ email: '  Foo@Bar.COM  ' } as any);

    expect(repo.findOne).toHaveBeenCalledWith({
      where: { email: 'foo@bar.com' },
    });
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'foo@bar.com' }),
    );
  });

  it('creates a new subscriber with the provided source, defaulting to landing_page', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockImplementation((s: any) => s);
    repo.save.mockImplementation((s: any) => Promise.resolve(s));

    const result = await service.subscribe({ email: 'a@b.com' } as any);

    expect(repo.create).toHaveBeenCalledWith({
      email: 'a@b.com',
      source: 'landing_page',
    });
    expect(result).toEqual({
      success: true,
      message: 'Successfully subscribed.',
    });
  });

  it('uses a custom source when provided', async () => {
    repo.findOne.mockResolvedValue(null);
    repo.create.mockImplementation((s: any) => s);
    repo.save.mockImplementation((s: any) => Promise.resolve(s));

    await service.subscribe({ email: 'a@b.com', source: 'footer' } as any);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ source: 'footer' }),
    );
  });

  it('reactivates an unsubscribed subscriber', async () => {
    const existing = {
      email: 'a@b.com',
      status: SubscriptionStatus.UNSUBSCRIBED,
    };
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation((s: any) => Promise.resolve(s));

    const result = await service.subscribe({ email: 'a@b.com' } as any);

    expect(existing.status).toBe(SubscriptionStatus.ACTIVE);
    expect(repo.save).toHaveBeenCalledWith(existing);
    expect(result).toEqual({
      success: true,
      message: 'Successfully resubscribed.',
    });
  });

  it('returns a generic success message without side effects for an already-active subscriber', async () => {
    const existing = {
      email: 'a@b.com',
      status: SubscriptionStatus.ACTIVE,
    };
    repo.findOne.mockResolvedValue(existing);

    const result = await service.subscribe({ email: 'a@b.com' } as any);

    expect(repo.save).not.toHaveBeenCalled();
    expect(repo.create).not.toHaveBeenCalled();
    expect(result).toEqual({ success: true, message: 'Already subscribed.' });
  });
});
