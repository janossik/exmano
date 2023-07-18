import { EventEmitter } from 'events';
import { ApplticationRouter, Handler } from './types';
import { pathToRegexp, match } from 'path-to-regexp';
import { routerFactoryForRequest } from './utils/router-factory-for-request';
import { preparePathname } from './utils/prepare-pathname';

export abstract class ManagerRequestEmitter extends EventEmitter {
  middlewares: Handler[] = [];
  routers: Record<string, ApplticationRouter> = {};

  request(method: string, pathname: string, ...handlers: Handler[]) {
    this.routers[pathname] = routerFactoryForRequest(method, pathname, this.middlewares, handlers);
    return this;
  }
  get(pathname: string, ...handlers: Handler[]) {
    return this.request('GET', pathname, ...handlers);
  }
  post(pathname: string, ...handlers: Handler[]) {
    return this.request('POST', pathname, ...handlers);
  }
  put(pathname: string, ...handlers: Handler[]) {
    return this.request('PUT', pathname, ...handlers);
  }
  delete(pathname: string, ...handlers: Handler[]) {
    return this.request('DELETE', pathname, ...handlers);
  }

  addRouter(pathname: string, router: ManagerRequestEmitter & { pathname: string }): this;
  addRouter(router: ManagerRequestEmitter & { pathname: string }): this;
  addRouter(arg1: string | (ManagerRequestEmitter & { pathname: string }), arg2?: ManagerRequestEmitter & { pathname: string }) {
    let normalizedPathname: string;
    let router: ManagerRequestEmitter & { pathname: string };

    if (typeof arg1 === 'string') {
      normalizedPathname = arg1;
      router = arg2!;
    } else {
      normalizedPathname = '';
      router = arg1;
    }

    for (const currentRouter of Object.values(router.routers)) {
      currentRouter.pathname = preparePathname(normalizedPathname, router.pathname, currentRouter.pathname);

      currentRouter.regexp = pathToRegexp(currentRouter.pathname);
      currentRouter.match = match(currentRouter.pathname, { decode: decodeURIComponent });
      currentRouter.handlers = new Set([...this.middlewares, ...currentRouter.handlers]);

      this.routers[currentRouter.pathname] = currentRouter;
    }
    return this;
  }

  use(pathname: string, router: ManagerRequestEmitter & { pathname: string }): this;
  use(router: ManagerRequestEmitter & { pathname: string }): this;
  use(middleware: Handler): this;
  use(arg1: string | (ManagerRequestEmitter & { pathname: string }) | Handler, arg2?: ManagerRequestEmitter & { pathname: string }) {
    if (typeof arg1 === 'string') {
      if (arg2 === undefined) throw new Error('Invalid arguments');
      return this.addRouter(arg1, arg2!);
    }
    if (arg1 instanceof ManagerRequestEmitter) {
      return this.addRouter(arg1);
    }

    this.middlewares.push(arg1);
    for (const router of Object.values(this.routers)) {
      router.handlers.add(arg1);
    }

    return this;
  }
}
