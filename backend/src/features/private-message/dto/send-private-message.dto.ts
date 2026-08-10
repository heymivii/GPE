import { IsInt, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SendPrivateMessageDto {
  @IsInt()
  recipientId: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  content: string;
}
