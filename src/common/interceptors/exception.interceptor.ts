import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable } from 'rxjs';
import { PrismaExceptionHandler } from './handlers/prisma-exception.handler';
import { UserInputExceptionHandler } from './handlers/user-input-exception.handler';

/** Interceptor to transform app erros into HTTP errors
 *
 * For more about NestJs interceptors: https://docs.nestjs.com/interceptors
 */
@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  /** Catches app errors and throws the
   * respective HTTP error
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
        new UserInputExceptionHandler().handle(error);

        new PrismaExceptionHandler().handle(error);

        throw error;
      }),
    );
  }
}
