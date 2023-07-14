import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'index.ts',
    'src/Application.ts',
    'src/Request.ts',
    'src/Response.ts',
    'src/Router.ts',
    'src/middlewares/parse-cookies.ts',
    'src/middlewares/parse-body-to-json.ts',
  ],
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'lib',
});
