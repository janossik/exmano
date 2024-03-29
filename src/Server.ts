import * as http from 'http';
import * as https from 'https';
import { Request } from './Request';
import { Response } from './Response';
import { Appltication } from './Application';

export class Server extends http.Server<typeof Request<Record<string, unknown>>, typeof Response> {
  constructor(options: http.ServerOptions<typeof Request<Record<string, unknown>>, typeof Response>, application?: Appltication) {
    super(options);
    this.on('request', async (request: Request, response: Response) => {
      request.application = application;
      this.emit(request.method, request, response);
    });
  }
}

export const ServerHttp = Server;

export class ServerHttps extends https.Server<typeof Request<Record<string, unknown>>, typeof Response> {
  constructor(options: https.ServerOptions<typeof Request<Record<string, unknown>>, typeof Response>, application?: Appltication) {
    super(options);
    this.on('request', async (request: Request, response: Response) => {
      request.application = application;
      this.emit(request.method, request, response);
    });
  }
}
