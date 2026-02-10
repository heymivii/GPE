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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ForumMessageService } from './forum-message.service';
import { CreateForumMessageDto } from './dto/create-forum-message.dto';
import { UpdateForumMessageDto } from './dto/update-forum-message.dto';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Forum Message')
@Controller('forum-message')
export class ForumMessageController {
  constructor(private readonly forumMessageService: ForumMessageService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createForumMessageDto: CreateForumMessageDto) {
    return this.forumMessageService.create(createForumMessageDto);
  }

  @Get()
  findAll(@Query('topicId') topicId?: string) {
    if (topicId) {
      return this.forumMessageService.findByTopic(+topicId);
    }
    return this.forumMessageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.forumMessageService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateForumMessageDto: UpdateForumMessageDto,
  ) {
    return this.forumMessageService.update(+id, updateForumMessageDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.forumMessageService.remove(+id);
  }

  /* ────────── Moderation: Admin/Moderator delete any message ────────── */

  @Delete('moderate/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  moderateRemove(@Param('id') id: string) {
    return this.forumMessageService.moderatorRemove(+id);
  }

  /* ────────── Reports ────────── */

  @Post('report')
  @UseGuards(JwtAuthGuard)
  createReport(@Body() dto: CreateReportDto) {
    return this.forumMessageService.createReport(dto);
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
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { action: 'resolved' | 'rejected'; moderatorNote?: string },
  ) {
    return this.forumMessageService.resolveReport(
      +id,
      req.user.sub,
      body.action,
      body.moderatorNote,
    );
  }
}
