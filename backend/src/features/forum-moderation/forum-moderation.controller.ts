import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ForumModerationService } from './forum-moderation.service';
import { CreateForbiddenWordDto } from './dto/create-forbidden-word.dto';
import { UpdateForbiddenWordDto } from './dto/update-forbidden-word.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

// Toute la modération est réservée aux admins/modérateurs.
@ApiTags('Forum Moderation')
@Controller('forum-moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'moderator')
export class ForumModerationController {
  constructor(private readonly moderationService: ForumModerationService) {}

  // ── Mots interdits ──
  @Post('words')
  createWord(@Body() dto: CreateForbiddenWordDto) {
    return this.moderationService.createWord(dto);
  }

  @Get('words')
  listWords() {
    return this.moderationService.listWords();
  }

  @Patch('words/:id')
  updateWord(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateForbiddenWordDto,
  ) {
    return this.moderationService.updateWord(id, dto);
  }

  @Delete('words/:id')
  removeWord(@Param('id', ParseIntPipe) id: number) {
    return this.moderationService.removeWord(id);
  }

  // ── Utilisateurs à surveiller ──
  @Get('flagged-users')
  flaggedUsers(@Query('threshold') threshold?: string) {
    return this.moderationService.listFlaggedUsers(
      threshold ? parseInt(threshold, 10) : undefined,
    );
  }

  @Get('users/:id/warnings')
  userWarnings(@Param('id', ParseIntPipe) id: number) {
    return this.moderationService.listUserWarnings(id);
  }
}
