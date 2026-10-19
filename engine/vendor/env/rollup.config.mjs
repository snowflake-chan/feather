import { defineConfig } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import swc from '@rollup/plugin-swc';

// node 16.15以下需要这段 workaround，升级镜像后可以换回标准的import
import { createRequire } from 'module'; // Bring in the ability to create the 'require' method
const r = createRequire(import.meta.url); // construct the require method
const pkg = r('./package.json'); // use the require method

// Declarations and type checking are handled by the one-shot tsc command in
// package.json. @rollup/plugin-typescript creates a TypeScript watch program
// even for production builds and leaves a native macOS run loop alive after
// its file watchers close, so Rollup never exits. SWC only transpiles here.
export default defineConfig({
  input: {
    index: './src/index.ts',
    constants: './src/constants.ts',
  },
  output: [
    {
      dir: 'dist',
      format: 'cjs',
      entryFileNames: '[name].js',
      indent: false,
      sourcemap: true,
    },
    {
      dir: 'dist',
      format: 'es',
      entryFileNames: '[name].es.js',
      indent: false,
      sourcemap: true,
    },
  ],
  external: ['fs', 'path', 'ajv/dist/jtd', ...Object.keys(pkg.dependencies)],
  plugins: [
    swc(),
    commonjs({ extensions: ['.js', '.ts'] }),
    nodeResolve({ extensions: ['.mjs', '.js', '.json', '.node', '.ts'] }),
  ],
});
