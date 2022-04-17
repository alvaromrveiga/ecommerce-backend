import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from 'prisma-error-enum';
import { catchError, Observable } from 'rxjs';
import { EmailInUseException } from '../exceptions/email-in-use.exception';
import { ProductNameInUseException } from '../exceptions/product-name-in-use.exception';
import { ProductNotFoundException } from '../exceptions/product-not-found.exception';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

/** Interceptor for Prisma ORM errors
 *
 * For more about NestJs interceptors: https://docs.nestjs.com/interceptors
 */
@Injectable()
export class PrismaInterceptor implements NestInterceptor {
  /** Catches Prisma ORM errors and throws the
   * respective app HTTP error
   *
   * Uses default NestJs boilerplate, for more
   * information: https://docs.nestjs.com/interceptors
   */
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          switch (error.code) {
            case PrismaError.UniqueConstraintViolation:
              if (this.isEmailConstraintViolation(error.meta)) {
                throw new EmailInUseException();
              }

              if (this.isProductNameConstraintViolation(error)) {
                throw new ProductNameInUseException();
              }
              break;
            case PrismaError.RecordsNotFound: {
              if (this.isUserError(error)) {
                throw new UserNotFoundException();
              }

              if (this.isProductError(error)) {
                throw new ProductNotFoundException();
              }

              break;
            }
            default:
              throw error;
          }
        }

        if (this.isPrismaUnknownError(error)) {
          if (error.message === 'No Product found') {
            throw new ProductNotFoundException();
          }
        }

        throw error;
      }),
    );
  }

  /** Returns wether the error happened in the email field or not */
  private isEmailConstraintViolation(errorMeta: object): boolean {
    return Object.values(errorMeta)[0][0] === 'email';
  }

  /** Returns wether the error happened in the product name field or not */
  private isProductNameConstraintViolation(
    error: PrismaClientKnownRequestError,
  ): boolean {
    return (
      (Object.values(error.meta)[0][0] === 'name' ||
        Object.values(error.meta)[0][0] === 'urlName') &&
      error.message.includes('prisma.product')
    );
  }

  /** Checks if the error contains clientVersion,
   * making it an unknown prisma error
   * */
  private isPrismaUnknownError(error): boolean {
    return !!error.clientVersion;
  }

  /** Returns wether the error happened on an user prisma query or not */
  private isUserError(error: PrismaClientKnownRequestError): boolean {
    return error.message.includes('prisma.user');
  }

  /** Returns wether the error happened on an product prisma query or not */
  private isProductError(error: PrismaClientKnownRequestError): boolean {
    return error.message.includes('prisma.product');
  }
}
