import { IsNotEmpty, IsString } from 'class-validator';

/** Describes the information needed to authenticate an User to the application */
export class LoginCredentialsDto {
  /**
   * User email
   * @example "user@example.com"
   */
  @IsNotEmpty()
  @IsString()
  email: string;

  /**
   * User password
   * @example "abc123456"
   */
  @IsNotEmpty()
  @IsString()
  password: string;
}
