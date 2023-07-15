import * as http from 'http';
import * as https from 'https';
import { Request } from './Request';
import { Response } from './Response';
import { Server, ServerHttps } from './Server';
import { ApplticationRouter, ApplticationOptions, ErrorHandler } from './types';
import { NextFunctionFactory } from './utils/next-function-factory';
import { defaultErrorHandler } from './utils/default-error-handler';
import { ManagerRequestEmitter } from './Manage-request-emitter';

export class Appltication extends ManagerRequestEmitter {
  server: Server | ServerHttps | http.Server | https.Server;
  routers: Record<string, ApplticationRouter> = {};
  options: ApplticationOptions;
  private _errorHandler: ErrorHandler = defaultErrorHandler;

  constructor(server?: Server | null, options?: ApplticationOptions) {
    super();
    this.options = options || { useErrorHandler: true };
    this.server = server || new Server({ IncomingMessage: Request, ServerResponse: Response });
    this.init();
  }

  errorHandler(handler: ErrorHandler) {
    this._errorHandler = handler;
    return this;
  }

  listen(port: number, hostname: string, callback?: () => void) {
    this.server.listen(port, hostname, callback);
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
      for (const { regexp, method, handlers, match } of Object.values(this.routers)) {
        if (request.method !== method || regexp.exec(request.url!) === null) continue;
        const handValues = handlers.values();
        const matchedInfo = match(request.url!);
        if (matchedInfo) {
          request.params = matchedInfo.params as Record<string, string>;
        }
        const next = NextFunctionFactory(handValues, request, response, this.options.useErrorHandler, this._errorHandler);
        return handValues.next().value(request, response, next);
      }
      const error = new Error(`Method '${request.method}' for path '${request.url}' isn't exist`);
      if (!this.options.useErrorHandler) throw error;
      return this._errorHandler(error, request, response);
    });
  }
}
