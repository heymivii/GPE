import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateForumMessageDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsNumber()
  idTopic: number;

  @IsNotEmpty()
  @IsNumber()
  idUser: number;
}
