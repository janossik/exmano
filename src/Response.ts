import { IncomingMessage, ServerResponse } from 'http';

export class Response<TRequest extends IncomingMessage = IncomingMessage> extends ServerResponse<TRequest> {
  status(code: number) {
    this.statusCode = code;
    return this;
  }
  json(value: object) {
    this.write(JSON.stringify(value));
    this.end();
    return this;
  }
}
