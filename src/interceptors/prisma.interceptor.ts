import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaError } from 'prisma-error-enum';
import { catchError, Observable } from 'rxjs';
import { EmailInUseError } from 'src/errors/email-in-use.error';

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
              break;
            default:
              throw error;
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
}
