import { NotFoundException } from '@nestjs/common';

/** Throws HTTP status 404. Used when the user inputs
 * an user email or id that is not registered in the system
 */
export class UserNotFoundException extends NotFoundException {
  /** Throws HTTP status 404 with message
   * 'User not found'. Used when the user inputs an user
   * email or id that is not registered in the system
   */
  constructor() {
    super('User not found');
  }
}
