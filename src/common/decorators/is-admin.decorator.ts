import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RolesGuard } from '../guards/roles.guard';

/** Value to verify if @IsAdmin() is being used in the endpoint
 *
 * Consult <a href="../injectables/RolesGuard.html">RolesGuard</a>
 */
export const IS_ADMIN_KEY = 'isAdmin';

/** Makes an endpoint accessible only by admin users
 *
 * <br>Example: Create, update and remove products
 */
export function IsAdmin(): <TFunction>(
  target: object | TFunction,
  propertyKey?: string | symbol,
) => void {
  return applyDecorators(
    SetMetadata(IS_ADMIN_KEY, true),
    UseGuards(RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
    ApiForbiddenResponse({ description: 'Forbidden resource' }),
  );
}
