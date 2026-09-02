import {
  Controller,
  Post,
  Patch,
  Get,
  Body,
  Param,
  Request,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BuddyContactService } from './buddy-contact.service';

@ApiTags('Buddy Contact')
@Controller('buddy-contact')
@UseGuards(JwtAuthGuard)
export class BuddyContactController {
  constructor(private readonly buddyContactService: BuddyContactService) {}

  @Post('request')
  sendRequest(
    @Request() req,
    @Body() body: { recipientId: number; procedureId: number; message?: string },
  ) {
    return this.buddyContactService.sendRequest(
      req.user.userId,
      body.recipientId,
      body.procedureId,
      body.message,
    );
  }

  @Patch('request/:id')
  respondToRequest(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
    @Body() body: { accept: boolean },
  ) {
    return this.buddyContactService.respondToRequest(
      id,
      req.user.userId,
      body.accept,
    );
  }

  @Get('requests')
  getMyRequests(@Request() req) {
    return this.buddyContactService.getMyRequests(req.user.userId);
  }
}
