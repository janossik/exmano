import { Request } from '../Request';
import { Response } from '../Response';
import { NextFunction } from '../types';

export async function parseCookies(request: Request, response: Response, next: NextFunction) {
  const cookies: Record<string, string> = {};
  const cookieHeader = request.headers?.cookie;
  if (!cookieHeader) {
    request.cookies = cookies;
    return next();
  }
  const cookiePairs = cookieHeader.split(';');
  for (const cookiePair of cookiePairs) {
    const [name, ...rest] = cookiePair.split('=');
    const tempName = name?.trim();
    if (!tempName) {
      continue;
    }
    const value = rest.join('=').trim();
    if (!value) {
      continue;
    }
    cookies[tempName] = decodeURIComponent(value);
  }

  request.cookies = cookies;
  console.log('!!', next);
  await next();
}
