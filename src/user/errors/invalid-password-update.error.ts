import { BadRequestException } from '@nestjs/common';

/** Throws HTTP status 400. Used when the user inputs the wrong
 * current password when trying to create a new password
 */
export class InvalidPasswordUpdateError extends BadRequestException {
  /** Throws HTTP status 400 with message 'Invalid current password'.
   * Used when the user inputs the wrong current password when
   * trying to create a new password
   */
  constructor() {
    super('Invalid current password');
  }
}
