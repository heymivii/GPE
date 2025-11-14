import { PartialType } from '@nestjs/mapped-types';
import { CreateForumMessageDto } from './create-forum-message.dto';

export class UpdateForumMessageDto extends PartialType(CreateForumMessageDto) {}
