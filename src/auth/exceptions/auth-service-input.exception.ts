/**
 * Used to extend another exception to make it
 * instanceof AuthServiceInputException
 */
export class AuthServiceInputException extends Error {
  /**
   * Used to extend another exception to make it
   * instanceof AuthServiceInputException
   */
  constructor(message: string) {
    super(message);
  }
}
