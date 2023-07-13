import { EventEmitter } from 'events';
import * as http from 'http';
import * as https from 'https';
import { Key, pathToRegexp } from 'path-to-regexp';
import { Request } from './Request';
import { Response } from './Response';
import { Handler } from './types';

export interface ApplticationOptions {
  useErrorHandler?: boolean;
}

export class Server extends http.Server<typeof Request<Record<string, unknown>>, typeof Response> {
  constructor(options: http.ServerOptions<typeof Request<Record<string, unknown>>, typeof Response>) {
    super(options);
    this.on('request', async (request: Request, response: Response) => {
      this.emit(request.method, request, response);
    });
  }
}

export class Appltication extends EventEmitter {
  server: Server | http.Server | https.Server;
  middlewares: Array<Handler> = [];
  routers: Record<string, { method: string; path: string; regexp: RegExp; keys: Key[]; handlers: Set<Handler> }> = {};
  options: ApplticationOptions;
  errorHandler = async (err: unknown, request: Request, response: Response) => {
    console.error(err);

    if (err instanceof Error) {
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        return response.status(500).json({ message: 'Internal Server Error', details: err.stack?.split('\n') });
      }
      return response.status(500).json({ message: 'Internal Server Error', error: err.message });
    }

    response.status(500).json({ message: 'Internal Server Error', error: err });
  };
  constructor(server?: Server | null, options?: ApplticationOptions) {
    super();
    this.options = options || { useErrorHandler: true };
    this.server = server || new Server({ IncomingMessage: Request, ServerResponse: Response });
    this.init();
  }

  request(method: string, pathname: string, ...handlers: Handler[]) {
    const keys: Key[] = [];
    this.routers[pathname] = { method, path: pathname, regexp: pathToRegexp(pathname), keys, handlers: new Set([...this.middlewares, ...handlers]) };
  }
  get(pathname: string, ...handlers: Handler[]) {
    this.request('GET', pathname, ...handlers);
  }
  post(pathname: string, ...handlers: Handler[]) {
    this.request('POST', pathname, ...handlers);
  }
  put(pathname: string, ...handlers: Handler[]) {
    this.request('PUT', pathname, ...handlers);
  }
  delete(pathname: string, ...handlers: Handler[]) {
    this.request('DELETE', pathname, ...handlers);
  }

  use(middleware: Handler) {
    this.middlewares.push(middleware);
    for (const router of Object.values(this.routers)) {
      router.handlers.add(middleware);
    }
  }

  listen(port: number, hostname: string, callback?: () => void) {
    this.server.listen(port, hostname, callback);
  }

  private init() {
    this.server.on('request', async (request: Request, response: Response) => {
      this.server.emit(request.method, request, response);
      this.emit(request.method, request, response);
      this.emit('request', request, response);
    });
    this.on('request', async (request: Request, response: Response) => {
      for (const { regexp, method, handlers } of Object.values(this.routers)) {
        if (request.method !== method || regexp.exec(request.url!) === null) continue;
        const handValues = handlers.values();
        const next = async (err?: unknown) => {
          if (err) {
            if (!this.options.useErrorHandler) throw err;
            return await this.errorHandler(err, request, response);
          }
          try {
            await handValues.next().value(request, response, next);
          } catch (err) {
            if (!this.options.useErrorHandler) throw err;
            await this.errorHandler(err, request, response);
          }
        };

        return handValues.next().value(request, response, next);
      }
      response.status(404).json({ message: `Method '${request.method}' for path '${request.url}' isn't exist` });
    });
  }
}
