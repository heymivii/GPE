import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BuddyMessagesService } from './buddy-messages.service';

@ApiTags('Buddy Messages')
@Controller('buddy-messages')
@UseGuards(JwtAuthGuard)
export class BuddyMessagesController {
  constructor(private readonly buddyMessagesService: BuddyMessagesService) {}

  @Get('conversations')
  getConversations(@Request() req) {
    return this.buddyMessagesService.getConversations(req.user.userId);
  }

  @Get(':contactRequestId')
  getMessages(
    @Param('contactRequestId', ParseIntPipe) contactRequestId: number,
    @Request() req,
  ) {
    return this.buddyMessagesService.getMessages(contactRequestId, req.user.userId);
  }

  @Post(':contactRequestId')
  sendMessage(
    @Param('contactRequestId', ParseIntPipe) contactRequestId: number,
    @Request() req,
    @Body() body: { content: string },
  ) {
    return this.buddyMessagesService.sendMessage(
      contactRequestId,
      req.user.userId,
      body.content,
    );
  }

  @Patch(':contactRequestId/read')
  markAsRead(
    @Param('contactRequestId', ParseIntPipe) contactRequestId: number,
    @Request() req,
  ) {
    return this.buddyMessagesService.markAsRead(contactRequestId, req.user.userId);
  }
}
