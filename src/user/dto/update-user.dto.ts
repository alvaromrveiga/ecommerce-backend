import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  /**
   * User current password
   * @example "abc123456"
   */
  @IsString()
  @IsOptional()
  currentPassword?: string;
}
