import { Request } from '../Request';
import { Response } from '../Response';
import type { match } from 'path-to-regexp';

export type NextFunction = (err?: unknown) => Promise<void>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Handler = (request: Request, response: Response, next: NextFunction) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
