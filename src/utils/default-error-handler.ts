import { ErrorHandler } from '../types';

export const defaultErrorHandler: ErrorHandler = async (err, request, response) => {
  console.error(err);

  if (err instanceof Error) {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      return response.status(500).json({ message: 'Internal Server Error', details: err.stack?.split('\n') });
    }
    return response.status(500).json({ message: 'Internal Server Error', error: err.message });
  }

  response.status(500).json({ message: 'Internal Server Error', error: err });
};
