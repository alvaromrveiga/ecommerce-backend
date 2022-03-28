import { IsNotEmpty, IsString } from 'class-validator';

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
