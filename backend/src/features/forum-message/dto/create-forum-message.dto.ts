import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateForumMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  topicId: number;

  @IsNotEmpty()
  @IsNumber()
  userId: number;
}
