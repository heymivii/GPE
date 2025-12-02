import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  motherTongue?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  spokenLanguages?: string[];
}
