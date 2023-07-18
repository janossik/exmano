import { Request } from './Request';
import { Response } from './Response';
import { ApplticationOptions, ErrorHandler } from './types';
import { defaultErrorHandler } from './utils/default-error-handler';
import { Server, ServerHttps } from './Server';
import http from 'http';
import https from 'https';
import { Router } from './Router';

type SomeServer = Server | ServerHttps | http.Server | https.Server;
type VoidFunction = () => void;

export class Appltication extends Router {
  readonly server: SomeServer;
  options: ApplticationOptions;
  private _errorHandler: ErrorHandler = defaultErrorHandler;
  constructor(server?: SomeServer, options: ApplticationOptions = {}) {
    super();
    this.server =
      server ||
      new Server({
        ServerResponse: Response,
        IncomingMessage: Request,
      });
    this.options = options;
    this.init();
  }

  errorHandler(handler: ErrorHandler) {
    this._errorHandler = handler;
    return this;
  }

  listen(port: number, callback?: VoidFunction): this;
  listen(port: number, hostname: string, callback?: VoidFunction): this;
  listen(arg1: number, arg2?: VoidFunction | string, arg3?: VoidFunction): this {
    if (typeof arg2 === 'string') {
      this.server.listen(arg1, arg2, arg3);
      return this;
    }
    this.server.listen(arg1, arg2);
    return this;
  }

  private init() {
    this.server.on('request', async (request: Request, response: Response) => {
      this.server.emit(request.method, request, response);
      this.emit(request.method, request, response);
      this.emit('request', request, response);
    });
    this.on('request', async (request: Request, response: Response) => {
      response.setHeader('X-Powered-By', 'Exmano');
      const lists = this.routers[request.method];
      if (!lists) {
        const error = new Error(`Method '${request.method}' isn't exist`);
        if (!this.options.useErrorHandler) throw error;
        return this._errorHandler(error, request, response);
      }
      for (const list of lists) {
        if (!list.checkPathname(request.url!)) continue;
        const info = list.match(request.url!);
        if (info) {
          request.params = info.params as Record<string, string>;
        }
        const handlers = list.values();
        let handler = handlers.next();
        const next = async (err?: unknown) => {
          if (err) {
            if (!this.options.useErrorHandler) throw err;
            return await this._errorHandler(err, request, response);
          }
          try {
            handler = handlers.next();
            console.log(handler.value?.toString());
            handler.value && handler.value(request, response, next);
          } catch (err) {
            if (!this.options.useErrorHandler) throw err;
            return await this._errorHandler(err, request, response);
          }
        };
        console.log(handler.value?.toString());
        return handler.value && handler.value(request, response, next);
      }
      const error = new Error(`Method '${request.method}' for path '${request.url}' isn't exist`);
      if (!this.options.useErrorHandler) throw error;
      return this._errorHandler(error, request, response);
    });
  }
}
