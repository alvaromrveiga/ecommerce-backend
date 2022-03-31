import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { InvalidEmailOrPasswordError } from './errors/invalid-email-or-password.error.';

/** Responsible for authenticating the user */
@Injectable()
export class AuthService {
  /** Responsible for authenticating the user
   *
   * Instantiate the class and the UserService and
   * JwtService dependencies
   */
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /** Validates if the inputted email exists and
   * compares if the hashed password matches the inputted one.
   *
   * If so, returns the JWT accessToken
   */
  async login(
    email: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    const user = await this.validateUser(email, password);

    const payload = { sub: user.id };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  /** Validates if the inputted email exists and
   * compares if the hashed password matches the inputted one.
   *
   * If not, throws an error
   */
  private async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);

    if (user) {
      const isPasswordValid = await compare(password, user.password);

      if (isPasswordValid) {
        return { ...user, password: undefined };
      }
    }

    throw new InvalidEmailOrPasswordError();
  }
}
