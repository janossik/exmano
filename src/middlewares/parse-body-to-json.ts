import { Request } from '../Request';
import { Response } from '../Response';
import { NextFunction } from '../types';

export async function parseBodyToJson(request: Request, response: Response, next: NextFunction) {
  const chunks: Buffer[] = [];
  const parse = () => {
    return new Promise((resolve, reject) => {
      request.on('error', reject);
      request.on('data', (chunk: Buffer) => chunks.push(chunk));
      request.on('end', () => {
        request.body = JSON.parse(Buffer.concat(chunks).toString());
        resolve(request.body);
      });
    });
  };
  await parse();
  await next();
}
