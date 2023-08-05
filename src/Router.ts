import { EventEmitter } from 'events';
import { Handler } from './types';
import { preparePathname } from './utils/prepare-pathname';
import { pathToRegexp } from 'path-to-regexp';
import { LinkedList } from './LinkedList';

export class Router extends EventEmitter {
  private _pathname: string;
  readonly middlewares: Handler[] = [];
  readonly routers: Record<string, LinkedList[]> = {};
  private _paths: string[] = [];
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
        this.checkPath(list.method, preparePathname(this.pathname, list.pathname));
        list.regexp = pathToRegexp(preparePathname(pathname, list.pathname));
      }
    }
    this._pathname = preparePathname(pathname, this._pathname);
  }
  checkPath(method: string, pathname: string) {
    if (this._paths.includes(`${method}${pathname}`)) {
      throw new Error(`Pathname ${pathname} already exists`);
    }
    this._paths.push(`${method}${pathname}`);
  }
  request(method: string, pathname: string, ...handlers: Handler[]) {
    if (!this.routers[method]) {
      this.routers[method] = [] as LinkedList[];
    }
    const currentPathname = preparePathname(this.pathname, pathname);
    this.checkPath(method, currentPathname);
    const linkedList = new LinkedList(method, currentPathname, ...handlers);
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

      for (const key in router.routers) {
        if (!this.routers[key]) {
          this.routers[key] = [];
        }
        const lists = router.routers[key];
        for (const list of lists) {
          if (this.routers[key].includes(list)) {
            throw new Error(`The router was already used, ${key}:${list.pathname}`);
          }
          this.checkPath(list.method, preparePathname(this.pathname, list.pathname));
          list.prepend(...this.middlewares);
          this.routers[key] && this.routers[key].push(list);
        }
      }
      router.pathname = this.pathname;
      return this;
    }
    if (typeof arg1 === 'string') {
      if (!(arg2 instanceof Router)) {
        throw new TypeError('The second argument must be an instance of Router');
      }
      const router = arg2;
      for (const key in router.routers) {
        if (!this.routers[key]) {
          this.routers[key] = [];
        }
        const lists = router.routers[key];
        for (const list of lists) {
          if (this.routers[key].includes(list)) {
            throw new Error(`The router was already used, ${key}:${list.pathname}`);
          }
          this.checkPath(list.method, preparePathname(this.pathname, arg1, list.pathname));
          list.prepend(...this.middlewares);
          this.routers[key] && this.routers[key].push(list);
        }
      }
      router.pathname = preparePathname(this.pathname, arg1);
      return this;
    }
    if (arg2 instanceof Router) {
      throw new TypeError('The first argument must be a string');
    }
    this.middlewares.push(...([arg1, arg2, ...args].filter(Boolean) as Handler[]));
    return this;
  }
}
