import { PurchaseServiceInputException } from './purchase-service-input.exception';

/** Used if the users try to review a purchase that they do not own */
export class NotPurchaseOwnerException extends PurchaseServiceInputException {
  /** Throws exception with message 'Purchase not found'.
   *
   * Used if the users try to review a purchase that they do not own
   */
  constructor() {
    super('Purchase not found');
  }
}
