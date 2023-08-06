import { Request } from '../Request';
import { Response } from '../Response';
import { WebSocket } from 'ws';

export type NextFunction = (err?: unknown) => Promise<void>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Handler = (request: Request, response: Response, next: NextFunction) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ErrorHandler = (err: unknown, request: Request, response: Response) => any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WebSocketHandler = (ws: WebSocket, req: Request, next: () => any) => any;

export interface ApplticationOptions {
  useErrorHandler?: boolean;
}
