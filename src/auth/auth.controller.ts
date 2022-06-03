import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
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
  ): Promise<LoginResponse> {
    return this.authService.login(email, password);
  }

  /** Refreshes the user token for silent authentication */
  @ApiOperation({ summary: 'Refreshes user token' })
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() { refreshToken }: RefreshTokenDto,
  ): Promise<LoginResponse> {
    return this.authService.refreshToken(refreshToken);
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
}
