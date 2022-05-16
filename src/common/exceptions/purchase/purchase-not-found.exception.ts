import { NotFoundException } from '@nestjs/common';

/** Throws HTTP status 404. Used when the user inputs
 * a purchase that is not registered in the system
 */
export class PurchaseNotFoundException extends NotFoundException {
  /** Throws HTTP status 404 with message
   * 'Purchase not found'. Used when the user inputs
   * a purchase that is not registered in the system
   */
  constructor() {
    super('Purchase not found');
  }
}
