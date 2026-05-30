import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
mkdirSync('dist', { recursive: true });
const output = 'dist/spaizd-shopify-theme.zip';
if (existsSync(output)) rmSync(output);
const include = ['assets', 'config', 'layout', 'locales', 'sections', 'snippets', 'templates'];
const result = spawnSync('zip', ['-r', output, ...include], { stdio: 'inherit' });
process.exit(result.status ?? 1);
