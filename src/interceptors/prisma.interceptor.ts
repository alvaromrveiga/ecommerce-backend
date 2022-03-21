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

@Injectable()
export class PrismaInterceptor implements NestInterceptor {
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

  private isEmailConstraintViolation(errorMeta: object): boolean {
    return Object.values(errorMeta)[0][0] === 'email';
  }
}
