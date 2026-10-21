import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const webpack = path.join(here, 'game/node_modules/.bin/webpack');
const result = spawnSync(webpack, ['--config', path.join(here, 'webpack.config.cjs')], {
  cwd: here,
  stdio: 'inherit',
  env: { ...process.env },
});
if (result.status !== 0) process.exit(result.status ?? 1);
