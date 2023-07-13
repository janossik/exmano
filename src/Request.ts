import { IncomingMessage } from 'http';
import { Socket } from 'net';

export class Request<TBody = Record<string, unknown>> extends IncomingMessage {
  body: TBody = {} as TBody;
  method = '';
  private _cookies: Record<string, string> = {};
  constructor(args: Socket) {
    super(args);
  }

  set cookies(value: Record<string, string>) {
    this._cookies = value;
  }

  get cookies() {
    return this._cookies;
  }
}
