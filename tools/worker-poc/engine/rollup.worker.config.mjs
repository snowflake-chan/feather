/**
 * 构建：Worker 版 script shell 入口
 *
 * 与 rollup.config.mjs（ivm2）的区别：
 *  - 入口是 worker-script-entry.ts，不是 ivm2-script-entry.ts
 *  - 输出 CJS（worker_threads 直接 require），不是 iife
 *  - 不 externalize debug（Worker 里 Node 内置模块可用；如果部署环境没有 node_modules，
 *    也可以改成 external: ['debug'] 并把 debug 打进去）
 */
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import swc from '@rollup/plugin-swc';
import json from '@rollup/plugin-json';

export default {
  input: ['./src/utils/script-server/worker/worker-script-entry.ts'],
  external: ['worker_threads', 'crypto', 'debug'],
  output: [
    {
      dir: 'src/assets/worker',
      indent: false,
      format: 'cjs',
    },
    {
      dir: 'dist/src/assets/worker',
      indent: false,
      format: 'cjs',
    },
  ],
  plugins: [
    json(),
    typescript({
      tsconfig: './scripts/script-server/tsconfig.json',
      noEmit: true,
    }),
    swc({
      swc: {
        module: {
          type: 'es6',
        },
      },
    }),
    nodeResolve({
      preferBuiltins: true,
      exportConditions: ['node'],
    }),
    commonjs({
      extensions: ['.js', '.ts'],
    }),
  ],
};
