import { CustomDecorator, SetMetadata } from '@nestjs/common';

/** Value to verify if @Public() is being used in the endpoint
 *
 * Consult <a href="../injectables/JwtAuthGuard.html">JwtAuthGuard</a>
 */
export const IS_PUBLIC_KEY = 'isPublic';

/** Makes an endpoint accessible by unauthenticated users
 *
 * <br>Example: Create user and Login endpoints
 */
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
