import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { Application } from './Application';

export class Request<TBody = Record<string, unknown>> extends IncomingMessage {
  application?: Application;
  body: TBody = {} as TBody;
  private _params: Record<string, string> = {};
  method = '';
  private _cookies: Record<string, string> = {};

  constructor(args: Socket) {
    super(args);
  }

  get params() {
    return this._params;
  }

  set params(value: Record<string, string>) {
    this._params = value;
  }

  set param({ name, value }: { name: string; value: string }) {
    this._params[name] = value;
  }

  set cookies(value: Record<string, string>) {
    this._cookies = value;
  }

  get cookies() {
    return this._cookies;
  }
}
