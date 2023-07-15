import { Request } from '../Request';
import { Response } from '../Response';
import type { Key, match } from 'path-to-regexp';

export type NextFunction<CustomError extends Error = Error> = (err?: CustomError) => Promise<void>;
export type Handler<CustomError extends Error = Error> = (request: Request, response: Response, next: NextFunction<CustomError>) => void | Promise<void>;
export type ErrorHandler = (err: unknown, request: Request, response: Response) => unknown | Promise<unknown>;
export interface ApplticationOptions {
  useErrorHandler?: boolean;
}

export interface ApplticationRouter {
  method: string;
  path: string;
  regexp: RegExp;
  keys: Key[];
  handlers: Set<Handler>;
  match: ReturnType<typeof match>;
}
