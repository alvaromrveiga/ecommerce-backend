import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserTokens } from '@prisma/client';
import { compare } from 'bcrypt';
import { accessJwtConfig, refreshJwtConfig } from 'src/config/jwt.config';
import { User } from 'src/models/user/entities/user.entity';
import { UserService } from 'src/models/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { getTokenExpirationDate } from 'src/util/getTokenExpirationDate';
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
  async login(
    email: string,
    password: string,
    browserInfo?: string,
  ): Promise<LoginResponse> {
    const user = await this.validateUser(email, password);

    const payload = { sub: user.id, userRole: user.role };

    const accessToken = await this.generateAccessToken(payload);

    const refreshToken = await this.createRefreshToken(
      { sub: payload.sub },
      browserInfo,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  /** Refreshes and rotates user's access and refresh tokens */
  async refreshToken(
    refreshToken: string,
    browserInfo?: string,
  ): Promise<LoginResponse> {
    const refreshTokenContent: RefreshTokenPayload =
      await this.jwtService.verifyAsync(refreshToken, refreshJwtConfig);

    await this.validateRefreshToken(refreshToken, refreshTokenContent);

    const userRole = await this.getUserRole(refreshTokenContent.sub);

    const accessToken = await this.generateAccessToken({
      sub: refreshTokenContent.sub,
      userRole,
    });

    const newRefreshToken = await this.rotateRefreshToken(
      refreshToken,
      refreshTokenContent,
      browserInfo,
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

  /** Returns all user's active tokens */
  async findAllTokens(userId: string): Promise<UserTokens[]> {
    const tokens = await this.prismaService.userTokens.findMany({
      where: { userId },
    });

    return tokens;
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
  private async generateAccessToken(payload: {
    sub: string;
    userRole: string;
  }): Promise<string> {
    const accessToken = await this.jwtService.signAsync(
      payload,
      accessJwtConfig,
    );

    return accessToken;
  }

  /** Creates the refresh token and saves it in the database */
  private async createRefreshToken(
    payload: {
      sub: string;
      tokenFamily?: string;
    },
    browserInfo?: string,
  ): Promise<string> {
    if (!payload.tokenFamily) {
      payload.tokenFamily = uuidV4();
    }

    const refreshToken = await this.jwtService.signAsync(
      { ...payload },
      refreshJwtConfig,
    );

    await this.saveRefreshToken({
      userId: payload.sub,
      refreshToken,
      family: payload.tokenFamily,
      browserInfo,
    });

    return refreshToken;
  }

  /** Saves the new refresh token hashed in the database */
  private async saveRefreshToken(refreshTokenCredentials: {
    userId: string;
    refreshToken: string;
    family: string;
    browserInfo?: string;
  }): Promise<void> {
    const expiresAt = getTokenExpirationDate();

    await this.prismaService.userTokens.create({
      data: { ...refreshTokenCredentials, expiresAt },
    });
  }

  /** Checks if the refresh token is valid */
  private async validateRefreshToken(
    refreshToken: string,
    refreshTokenContent: RefreshTokenPayload,
  ): Promise<boolean> {
    const userTokens = await this.prismaService.userTokens.findMany({
      where: { userId: refreshTokenContent.sub, refreshToken },
    });

    const isRefreshTokenValid = userTokens.length > 0;

    if (!isRefreshTokenValid) {
      await this.removeRefreshTokenFamilyIfCompromised(
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
  private async removeRefreshTokenFamilyIfCompromised(
    userId: string,
    tokenFamily: string,
  ): Promise<void> {
    const familyTokens = await this.prismaService.userTokens.findMany({
      where: { userId, family: tokenFamily },
    });

    if (familyTokens.length > 0) {
      await this.prismaService.userTokens.deleteMany({
        where: { userId, family: tokenFamily },
      });
    }
  }

  /** Removes the old token from the database and creates a new one */
  private async rotateRefreshToken(
    refreshToken: string,
    refreshTokenContent: RefreshTokenPayload,
    browserInfo?: string,
  ): Promise<string> {
    await this.prismaService.userTokens.deleteMany({ where: { refreshToken } });

    const newRefreshToken = await this.createRefreshToken(
      {
        sub: refreshTokenContent.sub,
        tokenFamily: refreshTokenContent.tokenFamily,
      },
      browserInfo,
    );

    return newRefreshToken;
  }

  private async getUserRole(userId: string): Promise<string> {
    const user = await this.userService.findById(userId);

    return user.role;
  }
}
