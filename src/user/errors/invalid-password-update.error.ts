import { BadRequestException } from '@nestjs/common';

export class InvalidPasswordUpdateError extends BadRequestException {
  constructor() {
    super('Invalid current password');
  }
}
