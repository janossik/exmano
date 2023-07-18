import { Request } from '../Request';
import { Response } from '../Response';
import type { match } from 'path-to-regexp';

export type NextFunction = (err?: unknown) => Promise<void>;
export type Handler = (request: Request, response: Response, next: NextFunction) => void | Promise<void>;
export type ErrorHandler = (err: unknown, request: Request, response: Response) => any;
export interface ApplticationOptions {
  useErrorHandler?: boolean;
}

export interface ApplticationRouter {
  pathname: string;
  method: string;
  regexp: RegExp;
  handlers: Set<Handler>;
  match: ReturnType<typeof match>;
}
