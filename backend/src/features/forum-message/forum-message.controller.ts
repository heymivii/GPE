import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ForumMessageService } from './forum-message.service';
import { CreateForumMessageDto } from './dto/create-forum-message.dto';
import { UpdateForumMessageDto } from './dto/update-forum-message.dto';

@Controller('forum-message')
export class ForumMessageController {
  constructor(private readonly forumMessageService: ForumMessageService) {}

  @Post()
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
  update(@Param('id') id: string, @Body() updateForumMessageDto: UpdateForumMessageDto) {
    return this.forumMessageService.update(+id, updateForumMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.forumMessageService.remove(+id);
  }
}
