import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ForumMessageService } from './forum-message.service';
import { CreateForumMessageDto } from './dto/create-forum-message.dto';
import { UpdateForumMessageDto } from './dto/update-forum-message.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { RateMessageDto } from './dto/rate-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SupportRatingService } from '../support-rating/support-rating.service';

@ApiTags('Forum Message')
@Controller('forum-message')
export class ForumMessageController {
  constructor(
    private readonly forumMessageService: ForumMessageService,
    private readonly supportRatingService: SupportRatingService,
  ) {}

  // ── F4 : notation de l'aide reçue ──────────────────────────────

  @Post(':id/rate')
  @UseGuards(JwtAuthGuard)
  rate(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RateMessageDto,
  ) {
    return this.supportRatingService.rate(
      req.user.userId,
      id,
      dto.stars,
      dto.comment,
    );
  }

  @Delete(':id/rate')
  @UseGuards(JwtAuthGuard)
  unrate(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.supportRatingService.unrate(req.user.userId, id);
  }

  /** Mes notes pour les messages d'un topic — hydrate l'UI au chargement. */
  @Get('ratings/mine')
  @UseGuards(JwtAuthGuard)
  myRatings(@Req() req: any, @Query('topicId', ParseIntPipe) topicId: number) {
    return this.supportRatingService.getMyRatingsForTopic(
      req.user.userId,
      topicId,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: any, @Body() createForumMessageDto: CreateForumMessageDto) {
    // Auteur = utilisateur authentifié (fini l'usurpation via un userId du body).
    return this.forumMessageService.create(
      req.user.userId,
      createForumMessageDto,
    );
  }

  @Get()
  findAll(@Query('topicId') topicId?: string) {
    if (topicId) {
      return this.forumMessageService.findByTopic(+topicId);
    }
    return this.forumMessageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.forumMessageService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateForumMessageDto: UpdateForumMessageDto,
  ) {
    return this.forumMessageService.update(
      id,
      req.user.userId,
      updateForumMessageDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.forumMessageService.remove(id, req.user.userId);
  }

  @Delete('moderate/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  moderateRemove(@Param('id', ParseIntPipe) id: number) {
    return this.forumMessageService.moderatorRemove(id);
  }

  @Post('report')
  @UseGuards(JwtAuthGuard)
  createReport(@Req() req: any, @Body() dto: CreateReportDto) {
    // Le rapporteur est l'utilisateur authentifié — pas un reporterId du body.
    return this.forumMessageService.createReport(req.user.userId, dto);
  }

  @Get('reports/all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  findAllReports(@Query('status') status?: string) {
    return this.forumMessageService.findAllReports(status);
  }

  @Get('reports/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  getReportStats() {
    return this.forumMessageService.getReportStats();
  }

  @Patch('reports/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  resolveReport(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: any,
    @Body() body: { action: 'resolved' | 'rejected'; moderatorNote?: string },
  ) {
    // req.user.userId (le payload JWT n'a pas de `sub` → moderatorId était undefined).
    return this.forumMessageService.resolveReport(
      id,
      req.user.userId,
      body.action,
      body.moderatorNote,
    );
  }
}
