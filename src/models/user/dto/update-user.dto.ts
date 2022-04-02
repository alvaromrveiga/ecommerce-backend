import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

/** Describes the User fields that are updatable
 *
 * <br>Note that since this is a
 * <u>Partial of <a href="CreateUserDto.html">CreateUserDto</a></u>,
 * any field there is optional here
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {
  /**
   * User current password
   * @example "abc123456"
   */
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  currentPassword?: string;
}
