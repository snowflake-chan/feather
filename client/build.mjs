import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const gameRoot = path.resolve(
  process.env.BOX_GAME_ROOT || path.join(here, '../../box3-local-engine/apps/game'),
);
const webpack = path.join(gameRoot, 'node_modules/.bin/webpack');
const result = spawnSync(webpack, ['--config', path.join(here, 'webpack.config.cjs')], {
  cwd: gameRoot,
  stdio: 'inherit',
  env: { ...process.env, BOX_GAME_ROOT: gameRoot },
});
if (result.status !== 0) process.exit(result.status ?? 1);
