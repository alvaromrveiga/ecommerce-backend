import { BadRequestException } from '@nestjs/common';
import { UserServiceInputException } from 'src/models/user/exceptions/user-service-input.exception';
import { ExceptionHandler } from './exception.handler';

/** Catches user input errors and throws the
 * respective HTTP error
 */
export class UserInputExceptionHandler implements ExceptionHandler {
  /** Catches user input errors and throws the
   * respective HTTP error
   */
  handle(error: Error): void {
    if (error instanceof UserServiceInputException) {
      throw new BadRequestException(error.message);
    }
  }
}
