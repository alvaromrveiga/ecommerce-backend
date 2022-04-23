/**
 * Used to extend another exception to make it
 * instanceof ProductServiceInputException
 */
export class ProductServiceInputException extends Error {
  /**
   * Used to extend another exception to make it
   * instanceof ProductServiceInputException
   */
  constructor(message: string) {
    super(message);
  }
}
