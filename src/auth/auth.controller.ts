import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { Public } from './public.decorator';

@ApiTags('authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() { email, password }: LoginCredentialsDto,
  ): Promise<{ accessToken: string }> {
    return this.authService.login(email, password);
  }
}
