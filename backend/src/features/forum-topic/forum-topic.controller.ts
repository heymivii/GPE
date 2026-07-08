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
  Request,
} from '@nestjs/common';
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
  create(@Request() req, @Body() createForumTopicDto: CreateForumTopicDto) {
    // Auteur = utilisateur authentifié (fini l'usurpation via un userId du body).
    return this.forumTopicService.create(req.user.userId, createForumTopicDto);
  }

  @Get()
  findAll() {
    return this.forumTopicService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.forumTopicService.getStats();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // Incrémente le compteur de vues à l'ouverture.
    return this.forumTopicService.findOnePublic(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateForumTopicDto: UpdateForumTopicDto,
  ) {
    return this.forumTopicService.update(id, req.user.userId, updateForumTopicDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req, @Param('id', ParseIntPipe) id: number) {
    return this.forumTopicService.remove(id, req.user.userId);
  }

  @Patch(':id/lock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  lockTopic(@Param('id', ParseIntPipe) id: number) {
    return this.forumTopicService.lockTopic(id);
  }

  @Patch(':id/pin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  pinTopic(@Param('id', ParseIntPipe) id: number) {
    return this.forumTopicService.pinTopic(id);
  }

  @Delete('moderate/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  moderatorRemove(@Param('id', ParseIntPipe) id: number) {
    return this.forumTopicService.moderatorRemove(id);
  }
}
