import { ErrorHandler } from '../types';
import { HttpError } from '../errors/HttpError'

export const defaultErrorHandler: ErrorHandler = async (err, request, response) => {
  if (err instanceof HttpError) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      return response.status(err.code).json({ message: err.message, details: err.stack?.split('\n') });
    }
    return response.status(err.code).json({ message: err.message });
  }

  if (err instanceof Error) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      return response.status(500).json({ error: 'Internal Server Error', details: err.stack?.split('\n') });
    }
    return response.status(500).json({ error: 'Internal Server Error', message: err.message });
  }

  response.status(500).json({ error: 'Internal Server Error', message: err });
};
