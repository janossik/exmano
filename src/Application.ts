import http from 'http';
import https from 'https';
import { Request } from './Request';
import { Response } from './Response';
import { ApplticationOptions, ErrorHandler } from './types';
import { defaultErrorHandler } from './utils/default-error-handler';
import { Server, ServerHttps } from './Server';
import { Router } from './Router';
import { HttpError } from './errors/HttpError';

type SomeServer = Server | ServerHttps | http.Server | https.Server;
type VoidFunction = () => void;

export class Application extends Router {
  readonly server: SomeServer;
  options: ApplticationOptions;
  private _errorHandler: ErrorHandler = defaultErrorHandler;
  constructor(options: ApplticationOptions = {}, server?: SomeServer) {
    super();
    this.server =
      server ||
      new Server(
        {
          ServerResponse: Response,
          IncomingMessage: Request,
        },
        this,
      );
    this.options = options;
    this.init();
  }

  errorHandler(handler: ErrorHandler) {
    this._errorHandler = handler;
    return this;
  }

  listen(port: number, callback?: VoidFunction): this;
  listen(port: number, hostname: string, callback?: VoidFunction): this;
  listen(arg1: number, arg2?: VoidFunction | string, arg3?: VoidFunction): this {
    this.connections();
    if (typeof arg2 === 'string') {
      this.server.listen(arg1, arg2, arg3);
      return this;
    }
    this.server.listen(arg1, arg2);
    return this;
  }

  private connections() {
    for (const list of this.webSockets) {
      if (!list?.webSocketServer) continue;
      list.webSocketServer.on('connection', async (webSocket, incomingMessage) => {
        console.log(list);

        let node = list.head;
        const next = async (err?: unknown) => {
          if (err) {
            webSocket.send(JSON.stringify(err));
            return webSocket.terminate();
          }
          try {
            node = node?.next || null;
            await node?.handler.call(this, webSocket, { incomingMessage }, next);
          } catch (err) {
            webSocket.send(JSON.stringify(err));
            return webSocket.terminate();
          }
        };
        return node && (await node?.handler.call(this, webSocket, { incomingMessage }, next));
      });
    }
  }

  private upgrade() {
    this.server.on('upgrade', (request, socket, head) => {
      if (!request.url) {
        socket.destroy();
        throw new Error('URL not found');
      }

      for (const { webSocketServer: server, regexp } of this.webSockets) {
        if (!server) continue;
        if (regexp.exec(request.url) !== null) {
          return server.handleUpgrade(request, socket, head, function done(ws) {
            server.emit('connection', ws, request);
          });
        }
      }
      socket.destroy();
    });
  }
  private serverEventToApplicationEvent() {
    this.server.on('request', async (request: Request, response: Response) => {
      this.server.emit(request.method, request, response);
      this.emit(request.method, request, response);
      this.emit('request', request, response);
    });
  }

  private requestApplicationListener() {
    this.on('request', async (request: Request, response: Response) => {
      response.setHeader('X-Powered-By', 'Exmano');
      const lists = this.routers[request.method];
      if (!lists) {
        const error = new HttpError(`Method '${request.method}' isn't exist`, 404);
        if (!this.options.useErrorHandler) throw error;
        return this._errorHandler(error, request, response);
      }
      for (const list of lists) {
        if (!list.checkPathname(request.url!)) continue;
        const info = list.match(request.url!);
        if (info) {
          request.params = info.params as Record<string, string>;
        }

        let node = list.head;

        const next = async (err?: unknown) => {
          if (err) {
            if (!this.options.useErrorHandler) throw err;
            return await this._errorHandler(err, request, response);
          }
          try {
            node = node?.next || null;
            await node?.handler.call(this, request, response, next);
          } catch (err) {
            if (!this.options.useErrorHandler) throw err;
            return await this._errorHandler(err, request, response);
          }
        };
        try {
          return node && (await node.handler.call(this, request, response, next));
        } catch (err) {
          if (!this.options.useErrorHandler) throw err;
          return await this._errorHandler(err, request, response);
        }
      }
      const error = new HttpError(`Method '${request.method}' for path '${request.url}' isn't exist`, 404);
      if (!this.options.useErrorHandler) throw error;
      return this._errorHandler(error, request, response);
    });
  }
  private init() {
    this.serverEventToApplicationEvent();
    this.requestApplicationListener();
    this.upgrade();
  }
}
