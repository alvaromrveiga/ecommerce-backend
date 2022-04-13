import { Role } from '@prisma/client';
import { IsEmail, IsEnum } from 'class-validator';

/** Describes the information needed to update an User role */
export class UpdateUserRoleDto {
  /**
   * User email
   * @example "user@example.com"
   */
  @IsEmail()
  email: string;

  /**
   * User new role
   * @example "ADMIN"
   */
  @IsEnum(Role)
  role: Role;
}
