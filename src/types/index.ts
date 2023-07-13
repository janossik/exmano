import { Request } from '../Request';
import { Response } from '../Response';
export type NextFunction<CustomError extends Error = Error> = (err?: CustomError) => void | Promise<void>;
export type Handler<CustomError extends Error = Error> = (request: Request, response: Response, next: NextFunction<CustomError>) => void | Promise<void>;
