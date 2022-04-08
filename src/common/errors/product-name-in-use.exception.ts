import { BadRequestException } from '@nestjs/common';

/** Throws HTTP status 400. Used when the user inputs
 * a product name that is already registered in the system
 */
export class ProductNameInUseException extends BadRequestException {
  /** Throws HTTP status 400 with message
   * 'Product name already in use'. Used when the user inputs
   * a product name that is already registered in the system
   */
  constructor() {
    super('Product name already in use');
  }
}
