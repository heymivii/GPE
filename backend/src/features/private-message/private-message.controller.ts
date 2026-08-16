import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PrivateMessageService } from './private-message.service';
import { SendPrivateMessageDto } from './dto/send-private-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Private Message')
@Controller('private-message')
@UseGuards(JwtAuthGuard)
export class PrivateMessageController {
  constructor(private readonly service: PrivateMessageService) {}

  // Anti-spam : au-delà du throttle global, on borne l'envoi à 20 messages / minute.
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post()
  send(@Request() req: any, @Body() dto: SendPrivateMessageDto) {
    return this.service.send(req.user.userId, dto.recipientId, dto.content);
  }

  @Get('conversations')
  conversations(@Request() req: any) {
    return this.service.getConversations(req.user.userId);
  }

  @Get('unread-count')
  unreadCount(@Request() req: any) {
    return this.service.getUnreadCount(req.user.userId);
  }

  @Get('with/:userId')
  thread(@Request() req: any, @Param('userId', ParseIntPipe) userId: number) {
    return this.service.getThread(req.user.userId, userId);
  }

  @Patch(':id/read')
  markRead(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.service.markRead(id, req.user.userId);
  }
}
