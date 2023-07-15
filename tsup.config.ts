import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['index.ts', 'src/**/*.ts'],
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'lib',
});
