import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ForumTopicService } from './forum-topic.service';
import { CreateForumTopicDto } from './dto/create-forum-topic.dto';
import { UpdateForumTopicDto } from './dto/update-forum-topic.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Forum Topic')
@Controller('forum-topic')
export class ForumTopicController {
  constructor(private readonly forumTopicService: ForumTopicService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createForumTopicDto: CreateForumTopicDto) {
    return this.forumTopicService.create(createForumTopicDto);
  }

  @Get()
  findAll() {
    return this.forumTopicService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.forumTopicService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateForumTopicDto: UpdateForumTopicDto) {
    return this.forumTopicService.update(+id, updateForumTopicDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.forumTopicService.remove(+id);
  }

  // ─── Moderation endpoints ──────────────────────────────────────────

  @Patch(':id/lock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  lockTopic(@Param('id') id: string) {
    return this.forumTopicService.lockTopic(+id);
  }

  @Patch(':id/pin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  pinTopic(@Param('id') id: string) {
    return this.forumTopicService.pinTopic(+id);
  }

  @Delete('moderate/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  moderatorRemove(@Param('id') id: string) {
    return this.forumTopicService.moderatorRemove(+id);
  }
}
