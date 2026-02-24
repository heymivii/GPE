import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsletterSubscriber, SubscriptionStatus } from './entities/newsletter-subscriber.entity';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@Injectable()
export class NewsletterService {
    private readonly logger = new Logger(NewsletterService.name);

    constructor(
        @InjectRepository(NewsletterSubscriber)
        private readonly subscriberRepository: Repository<NewsletterSubscriber>,
    ) { }

    async subscribe(dto: SubscribeNewsletterDto): Promise<{ success: boolean; message: string }> {
        const email = dto.email.toLowerCase().trim();

        // Check if the email is already registered
        const existingSubscriber = await this.subscriberRepository.findOne({
            where: { email },
        });

        if (existingSubscriber) {
            if (existingSubscriber.status === SubscriptionStatus.UNSUBSCRIBED) {
                // Resubscribe
                existingSubscriber.status = SubscriptionStatus.ACTIVE;
                await this.subscriberRepository.save(existingSubscriber);
                this.logger.log(`Resubscribed email: ${email}`);
                return { success: true, message: 'Successfully resubscribed.' };
            }

            // Already active, treat as success without error to prevent data leakage
            this.logger.debug(`Already subscribed email attempted: ${email}`);
            return { success: true, message: 'Already subscribed.' };
        }

        // Create a new subscription
        const newSubscriber = this.subscriberRepository.create({
            email,
            source: dto.source || 'landing_page',
        });

        await this.subscriberRepository.save(newSubscriber);
        this.logger.log(`New subscription from email: ${email}`);

        return { success: true, message: 'Successfully subscribed.' };
    }
}
