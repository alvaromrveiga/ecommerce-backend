import { BadRequestException } from '@nestjs/common';

export class MissingPasswordUpdateError extends BadRequestException {
  constructor() {
    super('Please enter both new password and current password');
  }
}
