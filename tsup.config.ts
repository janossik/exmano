import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts', 'src/**/*.ts'],
  splitting: true,
  sourcemap: false,
  clean: true,
  outDir: 'lib',
});
