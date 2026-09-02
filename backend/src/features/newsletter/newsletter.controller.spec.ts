import { Test, TestingModule } from '@nestjs/testing';
import { NewsletterController } from './newsletter.controller';
import { NewsletterService } from './newsletter.service';

describe('NewsletterController', () => {
  let controller: NewsletterController;
  let service: jest.Mocked<NewsletterService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewsletterController],
      providers: [
        {
          provide: NewsletterService,
          useValue: { subscribe: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<NewsletterController>(NewsletterController);
    service = module.get(NewsletterService);
  });

  it('subscribe delegates to the service', async () => {
    const dto = { email: 'a@b.com' } as any;
    service.subscribe.mockResolvedValue({
      success: true,
      message: 'Successfully subscribed.',
    });

    const result = await controller.subscribe(dto);

    expect(service.subscribe).toHaveBeenCalledWith(dto);
    expect(result.success).toBe(true);
  });
});
