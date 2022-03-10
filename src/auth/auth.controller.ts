import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

interface LoginCredentials {
  email: string;
  password: string;
}

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() { email, password }: LoginCredentials,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(email, password);
  }
}
