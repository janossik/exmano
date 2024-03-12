export class HttpError extends Error {
  code: number;
  constructor(message: string, statusCode = 500) {
    super(message);
    this.code = statusCode;
  }
}
