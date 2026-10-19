import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';

// node 16.15以下需要这段 workaround，升级镜像后可以换回标准的import
import { createRequire } from 'module'; // Bring in the ability to create the 'require' method
const r = createRequire(import.meta.url); // construct the require method
const pkg = r('./package.json'); // use the require method

const commonConfig = {
  external: [],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      emitDeclarationOnly: true,
    }),
    nodeResolve({
      preferBuiltins: true,
    }),
    commonjs(),
    babel({
      presets: ['@babel/preset-typescript'],
      extensions: ['.ts', '.tsx'],
    }),
  ],
};

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: pkg.module,
        format: 'es',
        indent: false,
      },
      {
        file: pkg.main,
        format: 'cjs',
        indent: false,
      },
    ],
    external: commonConfig.external,
    plugins: commonConfig.plugins,
  },
];
