export class AppError extends Error {
  public readonly code?: string;
  public readonly userMessage: string;
  public readonly technicalDetails?: unknown;

  constructor(message: string, userMessage: string, code?: string, technicalDetails?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.userMessage = userMessage;
    this.code = code;
    this.technicalDetails = technicalDetails;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
