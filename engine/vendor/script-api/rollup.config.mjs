import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import resolve from '@rollup/plugin-node-resolve';

export default defineConfig({
  input: {
    server: './dist/types/server/global.d.ts',
    client: './dist/types/client/global.d.ts', // 目前输出dts是有问题的，需要手动删除最后一行export
  },
  output: [
    {
      dir: './dts',
      entryFileNames: '[name]-api-types.dts',
      format: 'es',
      indent: false,
      sourcemap: false,
    },
  ],
  plugins: [
    dts({
      respectExternal: true,
    }),
    resolve(),
  ],
});
