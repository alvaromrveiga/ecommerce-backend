import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthServiceInputException } from 'src/auth/exceptions/auth-service-input.exception';
import { ProductServiceInputException } from 'src/models/product/exceptions/product-service-input.exception';
import { PurchaseServiceInputException } from 'src/models/purchase/exceptions/purchase-service-input.exception';
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
    if (error instanceof AuthServiceInputException) {
      throw new UnauthorizedException(error.message);
    }

    if (error instanceof UserServiceInputException) {
      throw new BadRequestException(error.message);
    }

    if (error instanceof ProductServiceInputException) {
      throw new BadRequestException(error.message);
    }

    if (error instanceof PurchaseServiceInputException) {
      throw new NotFoundException(error.message);
    }
  }
}
