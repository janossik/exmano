import { ApplticationRouter, Handler } from '../types';
import { Key, pathToRegexp, match } from 'path-to-regexp';

export function routerFactoryForRequest(method: string, pathname: string, middlewares: Handler[], handlers: Handler[]): ApplticationRouter {
  const keys: Key[] = [];
  const currentPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return {
    method,
    path: currentPathname,
    regexp: pathToRegexp(currentPathname),
    keys,
    handlers: new Set([...middlewares, ...handlers]),
    match: match(currentPathname, { decode: decodeURIComponent }),
  };
}
