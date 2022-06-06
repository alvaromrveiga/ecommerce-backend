import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserTokens } from '@prisma/client';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { LoginResponse } from './dto/login.response';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from './public.decorator';

/** User authentication endpoints */
@ApiTags('authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Authenticates the User */
  @ApiOperation({ summary: 'Logs in user' })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() { email, password }: LoginCredentialsDto,
    @Req() request: Request,
  ): Promise<LoginResponse> {
    const browserInfo =
      `${request.ip} ${request.headers['user-agent']} ${request.headers['accept-language']}`.replace(
        / undefined/g,
        '',
      );

    return this.authService.login(email, password, browserInfo);
  }

  /** Refreshes the user token for silent authentication */
  @ApiOperation({ summary: 'Refreshes user token' })
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() { refreshToken }: RefreshTokenDto,
    @Req() request: Request,
  ): Promise<LoginResponse> {
    const browserInfo =
      `${request.ip} ${request.headers['user-agent']} ${request.headers['accept-language']}`.replace(
        / undefined/g,
        '',
      );

    return this.authService.refreshToken(refreshToken, browserInfo);
  }

  /** Logs out the User from the current session */
  @ApiOperation({ summary: 'Logs out user' })
  @ApiBearerAuth()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() { refreshToken }: LogoutDto): Promise<void> {
    return this.authService.logout(refreshToken);
  }

  /** Logs out the User from all sessions */
  @ApiOperation({ summary: 'Logs out user of all sessions' })
  @ApiBearerAuth()
  @Post('logoutAll')
  @HttpCode(HttpStatus.OK)
  async logoutAll(@Req() request: Request): Promise<void> {
    const { userId } = request.user as { userId: string };

    return this.authService.logoutAll(userId);
  }

  /** Returns all user's active tokens */
  @ApiOperation({ summary: 'Returns all user active tokens' })
  @ApiBearerAuth()
  @Get('tokens')
  async findAllTokens(@Req() request: Request): Promise<UserTokens[]> {
    const { userId } = request.user as { userId: string };

    return this.authService.findAllTokens(userId);
  }
}
