import { Request } from '../Request';
import { Response } from '../Response';
import { WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { Router } from '../Router';
import { Application } from '../Application';

export type NextFunction = (err?: unknown) => Promise<void>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Handler<T extends Router> = (this: T, request: Request, response: Response, next: NextFunction) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorHandler = (err: unknown, request: Request, response: Response) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WebSocketHandler = (this: Application, ws: WebSocket, req: Record<string, unknown> & { incomingMessage: IncomingMessage }, next: () => any) => any;

export interface ApplticationOptions {
  useErrorHandler?: boolean;
}
