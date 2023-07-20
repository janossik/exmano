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
  server?: Server,
  options: ApplticationOptions = {
    useErrorHandler: true,
  },
) {
  const app = new Appltication(server, options);
  app.use(parseBodyToJson);
  app.use(parseCookies);
  return app;
}
