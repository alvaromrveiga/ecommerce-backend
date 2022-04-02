import { BadRequestException } from '@nestjs/common';

/** Throws HTTP status 400. Used when the user inputs only the
 * current password or the new password, but both are needed to
 * update the password
 */
export class MissingPasswordUpdateError extends BadRequestException {
  /** Throws HTTP status 400 with message
   * 'Please enter both new password and current password'.
   * Used when the user inputs only the current password or
   * the new password, but both are needed to update the password
   */
  constructor() {
    super('Please enter both new password and current password');
  }
}
