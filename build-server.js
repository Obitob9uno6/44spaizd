import { build } from 'esbuild';

await build({
  entryPoints: ['server/index.js'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/index.js',
  external: ['pg-native'],
  banner: {
    js: "import { createRequire } from 'module'; const require = createRequire(import.meta.url);",
  },
});

console.log('Server built successfully');
