import { UnauthorizedException } from '@nestjs/common';
import { ExceptionHandler } from './exception.handler';

/** Catches JsonWebToken Errors and throws the
 * respective HTTP error
 */
export class JwtExceptionHandler implements ExceptionHandler {
  /** Possible Jwt Error names
   *
   * Refer to https://www.npmjs.com/package/jsonwebtoken#errors--codes
   */
  private jwtErrorNames = [
    'TokenExpiredError',
    'JsonWebTokenError',
    'NotBeforeError',
  ];

  /** Catches JsonWebToken Errors and throws the
   * respective HTTP error
   */
  handle(error: Error): void {
    if (this.isJwtException(error)) {
      throw new UnauthorizedException('Invalid authorization token');
    }
  }

  /** Returns whether the error is a JwtError or not */
  private isJwtException(error: Error): boolean {
    return this.jwtErrorNames.includes(error.name);
  }
}
