import { Appltication } from './src/Application';
import { Server } from './src/Server';
import { parseBodyToJson } from './src/middlewares/parse-body-to-json';
import { parseCookies } from './src/middlewares/parse-cookies';
import { ApplticationOptions } from './src/types';

export * from './src/Server';
export * from './src/Application';
export * from './src/Request';
export * from './src/Response';
export * from './src/Router';
export * from './src/middlewares/parse-cookies';
export * from './src/middlewares/parse-body-to-json';

export default function exmano(
  options: ApplticationOptions = {
    useErrorHandler: true,
  },
  server?: Server,
) {
  const app = new Appltication(options, server);
  app.use(parseBodyToJson);
  app.use(parseCookies);
  return app;
}
