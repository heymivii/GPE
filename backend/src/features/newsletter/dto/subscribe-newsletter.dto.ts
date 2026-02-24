import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubscribeNewsletterDto {
    @ApiProperty({ example: 'user@example.com', description: 'The email address to subscribe to the newsletter.' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiPropertyOptional({ example: 'landing_page', description: 'Where the subscription came from.' })
    @IsString()
    @IsOptional()
    source?: string;
}
