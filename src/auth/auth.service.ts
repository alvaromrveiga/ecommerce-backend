import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import ms from 'ms';
import { accessJwtConfig, refreshJwtConfig } from 'src/config/jwt.config';
import { User } from 'src/models/user/entities/user.entity';
import { UserService } from 'src/models/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidV4 } from 'uuid';
import { LoginResponse } from './dto/login.response';
import { InvalidEmailOrPasswordException } from './exceptions/invalid-email-or-password.exception.';
import { InvalidRefreshTokenException } from './exceptions/invalid-refresh-token.exception';
import { RefreshTokenPayload } from './types/refresh-token-payload';

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

    const accessToken = await this.generateAccessToken(user.id, user.role);

    const refreshToken = await this.createRefreshToken(user.id, user.role);

    return {
      accessToken,
      refreshToken,
    };
  }

  /** Refreshes and rotates user's access and refresh tokens */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const refreshTokenContent: RefreshTokenPayload =
      await this.jwtService.verifyAsync(refreshToken, refreshJwtConfig);

    await this.validateRefreshToken(refreshToken, refreshTokenContent);

    const accessToken = await this.generateAccessToken(
      refreshTokenContent.sub,
      refreshTokenContent.role,
    );

    const newRefreshToken = await this.rotateRefreshToken(
      refreshToken,
      refreshTokenContent,
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
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

    throw new InvalidEmailOrPasswordException();
  }

  /** Generates user's access token */
  private async generateAccessToken(
    userId: string,
    userRole: string,
  ): Promise<string> {
    const payload = { sub: userId, role: userRole };

    const accessToken = await this.jwtService.signAsync(
      payload,
      accessJwtConfig,
    );

    return accessToken;
  }

  /** Creates the refresh token and saves it in the database */
  private async createRefreshToken(
    userId: string,
    userRole: string,
    tokenFamily?: string,
  ): Promise<string> {
    if (!tokenFamily) {
      tokenFamily = uuidV4();
    }

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId, role: userRole, tokenFamily } as RefreshTokenPayload,
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

  /** Checks if the refresh token is valid */
  private async validateRefreshToken(
    refreshToken: string,
    refreshTokenContent: RefreshTokenPayload,
  ): Promise<boolean> {
    const isRefreshTokenValid = await this.prismaService.userTokens.findMany({
      where: { userId: refreshTokenContent.sub, refreshToken },
    });

    if (isRefreshTokenValid.length === 0) {
      await this.removeCompromisedRefreshTokenFamily(
        refreshTokenContent.sub,
        refreshTokenContent.tokenFamily,
      );

      throw new InvalidRefreshTokenException();
    }

    return true;
  }

  /** Removes a compromised refresh token family from the database
   *
   * If a token that is not in the database is used but it's family exists
   * that means the token has been compromised and the family should me removed
   *
   * Refer to https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation#automatic-reuse-detection
   */
  private async removeCompromisedRefreshTokenFamily(
    userId: string,
    tokenFamily: string,
  ): Promise<void> {
    await this.prismaService.userTokens.deleteMany({
      where: { userId, family: tokenFamily },
    });
  }

  /** Removes the old token from the database and creates a new one */
  private async rotateRefreshToken(
    refreshToken: string,
    refreshTokenContent: RefreshTokenPayload,
  ): Promise<string> {
    await this.prismaService.userTokens.deleteMany({ where: { refreshToken } });

    const newRefreshToken = await this.createRefreshToken(
      refreshTokenContent.sub,
      refreshTokenContent.role,
      refreshTokenContent.tokenFamily,
    );

    return newRefreshToken;
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
