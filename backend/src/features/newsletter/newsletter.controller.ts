import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { NewsletterService } from './newsletter.service';
import { SubscribeNewsletterDto } from './dto/subscribe-newsletter.dto';

@ApiTags('Newsletter')
@Controller('newsletter')
export class NewsletterController {
    constructor(private readonly newsletterService: NewsletterService) { }

    @Post('subscribe')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Subscribe an email to the newsletter' })
    @ApiResponse({ status: 200, description: 'Subscription processed successfully.' })
    @ApiResponse({ status: 400, description: 'Invalid email address.' })
    async subscribe(@Body() subscribeDto: SubscribeNewsletterDto) {
        return this.newsletterService.subscribe(subscribeDto);
    }
}
