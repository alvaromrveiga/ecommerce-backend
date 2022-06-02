import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { accessJwtConfig, refreshJwtConfig } from 'src/config/jwt.config';
import { User } from 'src/models/user/entities/user.entity';
import { UserService } from 'src/models/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginResponse } from './dto/login.response';
import { InvalidEmailOrPasswordError } from './errors/invalid-email-or-password.error.';
import { v4 as uuidV4 } from 'uuid';
import ms from 'ms';

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
    private readonly prismaService: PrismaService,
  ) {}

  /** Validates if the inputted email exists and
   * compares if the hashed password matches the inputted one.
   *
   * If so, returns the access and refresh JWTs
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const user = await this.validateUser(email, password);

    const payload = { sub: user.id, role: user.role };

    const accessToken = await this.jwtService.signAsync(
      payload,
      accessJwtConfig,
    );

    const refreshToken = await this.createRefreshToken(user.id);

    return {
      accessToken,
      refreshToken,
    };
  }

  /** Deletes the refreshToken from the database*/
  async logout(refreshToken: string): Promise<void> {
    await this.prismaService.userTokens.deleteMany({ where: { refreshToken } });
  }

  /** Deletes all user's refresh tokens */
  async logoutAll(userId: string): Promise<void> {
    await this.prismaService.userTokens.deleteMany({ where: { userId } });
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

  /** Creates the refresh token and saves it in the database */
  private async createRefreshToken(userId: string): Promise<string> {
    const tokenFamily = uuidV4();

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, family: tokenFamily },
      refreshJwtConfig,
    );

    await this.saveRefreshToken(userId, refreshToken, tokenFamily);

    return refreshToken;
  }

  /** Saves the new refresh token hashed in the database */
  private async saveRefreshToken(
    userId: string,
    refreshToken: string,
    family: string,
  ): Promise<void> {
    const expiresAt = this.getTokenExpirationDate();

    await this.prismaService.userTokens.create({
      data: { userId, refreshToken, family, expiresAt },
    });
  }

  /** Returns the token expiration date */
  private getTokenExpirationDate(): Date {
    const expiresInDays =
      ms(refreshJwtConfig.expiresIn as string) / 1000 / 60 / 60 / 24;

    const expiresAt = this.addDaysFromNow(expiresInDays);

    return expiresAt;
  }

  /** Add amount of days from today's date */
  private addDaysFromNow(days: number): Date {
    const result = new Date();
    result.setDate(result.getDate() + days);
    return result;
  }
}
