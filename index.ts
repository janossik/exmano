import { Appltication } from './src/Application';
import { Server } from './src/Server';
import { parseBodyToJson } from './src/middlewares/parse-body-to-json';
import { parseCookies } from './src/middlewares/parse-cookies';

export * from './src/utils/router-factory-for-request';
export * from './src/Server';
export * from './src/Application';
export * from './src/Request';
export * from './src/Response';
export * from './src/Router';
export * from './src/middlewares/parse-cookies';
export * from './src/middlewares/parse-body-to-json';

export default function exmano(server?: Server | null) {
  const app = new Appltication(server);
  app.use(parseBodyToJson);
  app.use(parseCookies);
  return app;
}
