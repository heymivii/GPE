import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ForumTopicService } from './forum-topic.service';
import { CreateForumTopicDto } from './dto/create-forum-topic.dto';
import { UpdateForumTopicDto } from './dto/update-forum-topic.dto';

@Controller('forum-topic')
export class ForumTopicController {
  constructor(private readonly forumTopicService: ForumTopicService) {}

  @Post()
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
  update(@Param('id') id: string, @Body() updateForumTopicDto: UpdateForumTopicDto) {
    return this.forumTopicService.update(+id, updateForumTopicDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.forumTopicService.remove(+id);
  }
}
