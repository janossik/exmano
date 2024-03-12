import { Application } from './src/Application';
import { Server } from './src/Server';
import { parseBodyToJson } from './src/middlewares/parse-body-to-json';
import { parseCookies } from './src/middlewares/parse-cookies';
import { ApplticationOptions } from './src/types';
import * as ServerModule from './src/Server';
import * as ApplicationModule from './src/Application';
import * as RequestModule from './src/Request';
import * as ResponseModule from './src/Response';
import * as RouterModule from './src/Router';
import * as CookieParserModule from './src/middlewares/parse-cookies';
import * as BodyParserModule from './src/middlewares/parse-body-to-json';
import * as HttpErrorModule from './src/errors/HttpError';

function exmano(
  options: ApplticationOptions = {
    useErrorHandler: true,
  },
  server?: Server,
) {
  const app = new Application(options, server);
  app.use(parseBodyToJson);
  app.use(parseCookies);
  return app;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace exmano {
  export const Server = ServerModule.Server;
  export const ServerHttp = ServerModule.ServerHttp;
  export const ServerHttps = ServerModule.ServerHttps;
  export const Application = ApplicationModule.Application;
  export const Request = RequestModule.Request;
  export const Response = ResponseModule.Response;
  export const Router = RouterModule.Router;
  export const parseCookies = CookieParserModule.parseCookies;
  export const parseBodyToJson = BodyParserModule.parseBodyToJson;
  export const HttpError = HttpErrorModule.HttpError;
}

export = exmano;
