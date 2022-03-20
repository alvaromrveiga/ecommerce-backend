import { BadRequestException } from '@nestjs/common';

export class EmailInUseError extends BadRequestException {
  constructor() {
    super('E-mail already in use');
  }
}
