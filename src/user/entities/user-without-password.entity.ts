import { OmitType } from '@nestjs/swagger';
import { User } from './user.entity';

export class UserWithoutPassword extends OmitType(User, [
  'password',
] as const) {}
