import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from 'prisma-error-enum';
import { catchError, Observable } from 'rxjs';
import { ProductNotFoundError } from 'src/models/product/errors/product-not-found.error';
import { EmailInUseError } from '../errors/email-in-use.error';
import { ProductNameInUseException } from '../errors/product-name-in-use.exception';

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
                throw new EmailInUseError();
              }

              if (this.isProductNameConstraintViolation(error)) {
                throw new ProductNameInUseException();
              }
              break;
            default:
              throw error;
          }
        }

        if (this.isPrismaUnknownError(error)) {
          if (error.message === 'No Product found') {
            throw new ProductNotFoundError();
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
}
