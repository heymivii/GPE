import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterService } from './newsletter.service';
import { NewsletterController } from './newsletter.controller';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';

@Module({
    imports: [TypeOrmModule.forFeature([NewsletterSubscriber])],
    controllers: [NewsletterController],
    providers: [NewsletterService],
    exports: [NewsletterService],
})
export class NewsletterModule { }
