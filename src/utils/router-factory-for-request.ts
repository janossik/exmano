import { ApplticationRouter, Handler } from '../types';
import { Key, pathToRegexp, match } from 'path-to-regexp';

export function routerFactoryForRequest(method: string, pathname: string, middlewares: Handler[], handlers: Handler[]): ApplticationRouter {
  const currentPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  return {
    method,
    pathname: currentPathname,
    regexp: pathToRegexp(currentPathname),
    handlers: new Set([...middlewares, ...handlers]),
    match: match(currentPathname, { decode: decodeURIComponent }),
  };
}
