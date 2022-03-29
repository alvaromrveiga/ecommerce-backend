import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { LoginResponse } from './dto/login.response';
import { Public } from './public.decorator';

@ApiTags('authentication')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Logs in user' })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() { email, password }: LoginCredentialsDto,
  ): Promise<LoginResponse> {
    return this.authService.login(email, password);
  }
}
