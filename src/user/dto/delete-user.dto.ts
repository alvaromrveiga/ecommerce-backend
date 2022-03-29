import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteUserDto {
  /**
   * User current password
   * @example "abc123456"
   */
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
}
