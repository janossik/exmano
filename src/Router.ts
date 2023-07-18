import { EventEmitter } from 'events';
import { Handler } from './types';
import { preparePathname } from './utils/prepare-pathname';
import { pathToRegexp } from 'path-to-regexp';
import { LinkedList } from './LinkedList';

export class Router extends EventEmitter {
  private _pathname: string;
  private middlewares: Handler[] = [];
  readonly routers: Record<string, LinkedList[]> = {};
  constructor(pathname = '/') {
    super();
    this._pathname = pathname;
  }
  get pathname() {
    return this._pathname;
  }
  set pathname(pathname: string) {
    for (const key in this.routers) {
      const lists = this.routers[key];
      for (const list of lists) {
        list.pathname = preparePathname(pathname, list.pathname);
        list.regexp = pathToRegexp(preparePathname(pathname, list.pathname));
      }
    }
    this._pathname = preparePathname(pathname, this._pathname);
  }
  request(method: string, pathname: string, ...handlers: Handler[]) {
    if (!this.routers[method]) {
      this.routers[method] = [] as LinkedList[];
    }
    const linkedList = new LinkedList(method, pathname, ...handlers);
    linkedList.prepend(...this.middlewares);

    linkedList.regexp = pathToRegexp(preparePathname(this.pathname, pathname));
    this.routers[method].push(linkedList);
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

  use(pathname: string, router: Router): this;
  use(router: Router): this;
  use(...middleware: Handler[]): this;
  use(arg1: string | Router | Handler, arg2?: Router | Handler, ...args: Handler[]) {
    if (arg1 instanceof Router) {
      const router = arg1;
      router.pathname = this.pathname;

      for (const key in router.routers) {
        const lists = router.routers[key];
        for (const list of lists) {
          this.routers[key] && this.routers[key].push(list);
        }
      }
      return this;
    }
    if (typeof arg1 === 'string') {
      if (!(arg2 instanceof Router)) {
        throw new TypeError('The second argument must be an instance of Router');
      }
      const router = arg2;
      router.pathname = preparePathname(this.pathname, arg1);
      for (const key in router.routers) {
        const lists = router.routers[key];
        for (const list of lists) {
          this.routers[key] && this.routers[key].push(list);
        }
      }
      return this;
    }
    if (arg2 instanceof Router) {
      throw new TypeError('The first argument must be a string');
    }
    this.middlewares.push(...([arg1, arg2, ...args].filter(Boolean) as Handler[]));
    return this;
  }
}
