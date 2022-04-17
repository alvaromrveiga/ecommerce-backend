import { NotFoundException } from '@nestjs/common';

/** Throws HTTP status 404. Used when the user inputs
 * a product that is not registered in the system
 */
export class ProductNotFoundException extends NotFoundException {
  /** Throws HTTP status 404 with message
   * 'Product not found'. Used when the user inputs
   * a product that is not registered in the system
   */
  constructor() {
    super('Product not found');
  }
}
