import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { Observable } from 'rxjs';
import { IS_ADMIN_KEY } from '../decorators/is-admin.decorator';

/** Checks if the user accessing the route is an admin
 *
 * For more on NestJs Guards: https://docs.nestjs.com/guards
 */
@Injectable()
export class RolesGuard implements CanActivate {
  /** Checks if the user accessing the route is an admin
   *
   * For more on NestJs Guards: https://docs.nestjs.com/guards
   *
   * Instantiates the class and the Reflector dependency
   */
  constructor(private reflector: Reflector) {}

  /** If the user is an Admin, access is allowed */
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isAdmin = this.reflector.getAllAndOverride<boolean>(IS_ADMIN_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();
    const { userRole } = request.user;

    if (isAdmin && userRole === Role.ADMIN) {
      return true;
    }

    return false;
  }
}
