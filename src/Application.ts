import { EventEmitter } from 'events';
import * as http from 'http';
import * as https from 'https';
import * as path from 'path';
import { Key, pathToRegexp } from 'path-to-regexp';
import { Request } from './Request';
import { Response } from './Response';
import { Handler } from './types';
import { Router } from './Router';
import { Server } from './Server';

export interface ApplticationOptions {
  useErrorHandler?: boolean;
}

export class Appltication extends EventEmitter {
  server: Server | http.Server | https.Server;
  middlewares: Array<Handler> = [];
  routers: Record<string, { method: string; path: string; regexp: RegExp; keys: Key[]; handlers: Set<Handler> }> = {};
  options: ApplticationOptions;
  errorHandler = async (err: unknown, request: Request, response: Response): Promise<unknown> => {
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
    this.routers[pathname] = {
      method,
      path: pathname.endsWith('/') ? pathname.slice(0, -1) : pathname,
      regexp: pathToRegexp(pathname.endsWith('/') ? pathname.slice(0, -1) : pathname),
      keys,
      handlers: new Set([...this.middlewares, ...handlers]),
    };
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

  addRouter(pathname: string, router: Router): void;
  addRouter(router: Router): void;
  addRouter(arg1: string | Router, arg2?: Router) {
    let normalizedPathname: string;
    let router: Router;

    if (typeof arg1 === 'string') {
      normalizedPathname = arg1;
      router = arg2!;
    } else {
      normalizedPathname = '';
      router = arg1;
    }

    for (const currentRouter of Object.values(router.routers)) {
      currentRouter.path = path.normalize(normalizedPathname + router.pathname + currentRouter.path);

      currentRouter.path = currentRouter.path.endsWith('/') ? currentRouter.path.slice(0, -1) : currentRouter.path;

      currentRouter.regexp = pathToRegexp(currentRouter.path, currentRouter.keys);
      currentRouter.handlers = new Set([...this.middlewares, ...currentRouter.handlers]);

      this.routers[currentRouter.path] = currentRouter;
    }
  }

  use(pathname: string, router: Router): void;
  use(router: Router): void;
  use(middleware: Handler): void;
  use(arg1: string | Router | Handler, arg2?: Router) {
    if (typeof arg1 === 'string') {
      if (arg2 === undefined) throw new Error('Invalid arguments');
      return this.addRouter(arg1, arg2!);
    }
    if (arg1 instanceof Router) {
      return this.addRouter(arg1);
    }

    this.middlewares.push(arg1);
    for (const router of Object.values(this.routers)) {
      router.handlers.add(arg1);
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
      const error = new Error(`Method '${request.method}' for path '${request.url}' isn't exist`);
      if (!this.options.useErrorHandler) throw error;
      return this.errorHandler(error, request, response);
    });
  }
}
