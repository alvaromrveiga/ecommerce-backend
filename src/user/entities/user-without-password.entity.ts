import { OmitType } from '@nestjs/swagger';
import { User } from './user.entity';

/** This entity is the same as
 * <a href="User.html">User</a>
 * but <u>omitting the password field</u>
 */
export class UserWithoutPassword extends OmitType(User, [
  'password',
] as const) {}
