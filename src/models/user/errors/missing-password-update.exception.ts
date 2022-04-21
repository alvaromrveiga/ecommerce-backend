import { UserServiceInputException } from './user-service-input.exception';

/** Used when the user inputs only the current password
 * or the new password, but both are needed to update
 * the password
 */
export class MissingPasswordUpdateException extends UserServiceInputException {
  /** Throws exception with message 'Please enter both new
   * password and current password'.
   *
   * Used when the user inputs only the current password
   * or the new password, but both are needed to update
   * the password
   */
  constructor() {
    super('Please enter both new password and current password');
  }
}
