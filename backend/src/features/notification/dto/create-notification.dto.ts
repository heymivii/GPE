import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
} from 'class-validator';

enum NotificationType {
  INFO = 'info',
  ALERT = 'alert',
  REMINDER = 'reminder',
  MESSAGE = 'message',
  SYSTEM = 'system',
  OTHER = 'other',
}

export class CreateNotificationDto {
  @IsOptional()
  @IsEnum(NotificationType)
  notificationType?: NotificationType;

  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsNumber()
  idUser: number;
}
