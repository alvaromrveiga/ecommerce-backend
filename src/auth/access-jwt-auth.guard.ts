import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from './public.decorator';

/** Uses the passport library AuthGuard to check
 * if the route needs authentication
 *
 * For more on NestJs Guards: https://docs.nestjs.com/guards
 */
@Injectable()
export class AccessJwtAuthGuard extends AuthGuard('access-jwt') {
  /** Uses the passport library AuthGuard to check
   * if the route needs authentication
   *
   * For more on NestJs Guards: https://docs.nestjs.com/guards
   *
   * Instantiates the class and the Reflector dependency
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /** If the route uses the Public decorator it
   * does not need authentication, else it does
   */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
