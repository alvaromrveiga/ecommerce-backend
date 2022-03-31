import { UnauthorizedException } from '@nestjs/common';

/** Throws HTTP status 401. Used when the user inputs
 * an email that is not registered in the system
 * or the wrong password for a registered email
 */
export class InvalidEmailOrPasswordError extends UnauthorizedException {
  /** Throws HTTP status 401 with message 'Invalid email or password'.
   * Used when the user inputs an email that is not registered
   * in the system or the wrong password for a registered email
   */
  constructor() {
    super('Invalid email or password');
  }
}
