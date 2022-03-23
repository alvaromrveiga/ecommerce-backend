import { UnauthorizedException } from '@nestjs/common';

export class InvalidEmailOrPasswordError extends UnauthorizedException {
  constructor() {
    super('Invalid email or password');
  }
}
