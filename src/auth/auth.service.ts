import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { hashConfig } from 'src/config/hash.config';
import { accessJwtConfig, refreshJwtConfig } from 'src/config/jwt.config';
import { User } from 'src/models/user/entities/user.entity';
import { UserService } from 'src/models/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginResponse } from './dto/login.response';
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

    const refreshToken = await this.jwtService.signAsync(
      { sub: payload.sub },
      refreshJwtConfig,
    );

    await this.saveRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
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

  /** Saves the new refresh token hashed in the database */
  private async saveRefreshToken(
    userId: string,
    newRefreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await hash(
      newRefreshToken,
      hashConfig.saltRounds,
    );

    await this.prismaService.userTokens.create({
      data: { userId, refreshToken: hashedRefreshToken },
    });
  }
}
