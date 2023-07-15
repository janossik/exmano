import { ErrorHandler, Handler } from '../types';
import { Request } from '../Request';
import { Response } from '../Response';

export function NextFunctionFactory(
  handlers: IterableIterator<Handler<Error>>,
  request: Request,
  response: Response,
  useErrorHandler?: boolean,
  errorHandler?: ErrorHandler,
) {
  return async function next(err?: unknown) {
    if (err) {
      if (!useErrorHandler) throw err;
      return errorHandler && (await errorHandler(err, request, response));
    }
    try {
      await handlers.next().value(request, response, next);
    } catch (err) {
      if (!useErrorHandler) throw err;
      errorHandler && (await errorHandler(err, request, response));
    }
  };
}
