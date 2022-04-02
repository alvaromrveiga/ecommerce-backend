import { IsNotEmpty, IsString } from 'class-validator';

/** Describes the fields needed to delete an User */
export class DeleteUserDto {
  /**
   * User current password
   * @example "abc123456"
   */
  @IsString()
  @IsNotEmpty()
  currentPassword: string;
}
