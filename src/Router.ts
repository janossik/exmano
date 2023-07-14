import { EventEmitter } from 'events';
import { Handler } from './types';
import { Key, pathToRegexp } from 'path-to-regexp';
import path from 'path';

export class Router extends EventEmitter {
  pathname: string;
  middlewares: Array<Handler> = [];
  routers: Record<string, { method: string; path: string; regexp: RegExp; keys: Key[]; handlers: Set<Handler> }> = {};

  constructor(path = '/') {
    super();
    this.pathname = path;
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
}
