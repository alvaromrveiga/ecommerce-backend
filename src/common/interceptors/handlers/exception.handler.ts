/** Interface for Exception Handlers */
export interface ExceptionHandler {
  /** Function to handle specific error types */
  handle(error: Error): void;
}
