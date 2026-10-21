const path = require('path');
const { createRequire } = require('module');

const here = __dirname;
const gameRoot = path.join(here, 'game');
const gameRequire = createRequire(path.join(gameRoot, 'package.json'));
const webpack = gameRequire('webpack');
const CopyPlugin = gameRequire('copy-webpack-plugin');

module.exports = {
  mode: 'production',
  target: 'web',
  devtool: 'source-map',
  optimization: { concatenateModules: false, minimize: false },
  entry: path.join(here, 'main.tsx'),
  output: {
    path: path.join(here, 'dist'),
    filename: 'main.js',
    publicPath: './',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: [{
          loader: 'ts-loader',
          options: {
            configFile: path.join(gameRoot, 'tsconfig.json'),
            transpileOnly: true,
            compilerOptions: { jsx: 'react-jsx', noEmit: false },
          },
        }],
      },
      { test: /\.wgsl$/i, type: 'asset/source' },
      { test: /\.glsl$/i, use: [path.join(here, 'glsl-loader.cjs'), 'glslify-loader'] },
      { test: /\.(jpg|jpeg|png|gif|svg|ico)$/i, type: 'asset/resource' },
      { test: /\.(ttf|otf|woff|woff2)$/i, type: 'asset/resource' },
      {
        test: /\.module\.css$/i,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { modules: { namedExport: false }, url: false } },
        ],
      },
      {
        test: /(?<!\.module)\.css$/i,
        use: ['style-loader', { loader: 'css-loader', options: { url: false } }],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          'style-loader',
          { loader: 'css-loader', options: { modules: { namedExport: false }, url: false } },
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new webpack.ProvidePlugin({ Buffer: ['buffer', 'Buffer'] }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production'),
      'process.env.NEXT_PUBLIC_EXPORT_MODE': JSON.stringify('true'),
      'process.env.NEXT_PUBLIC_DEPLOYMENT_MODE': JSON.stringify('play'),
    }),
    new CopyPlugin({
      patterns: [
        { from: path.join(here, 'index.html'), to: 'index.html' },
        { from: path.join(here, 'config.example.json'), to: 'config.json' },
      ],
    }),
  ],
  resolve: {
    alias: {
      '@game': gameRoot,
      src: path.join(gameRoot, 'src'),
      components: path.join(gameRoot, 'components'),
      assets: path.join(gameRoot, 'assets'),
      shared: path.join(gameRoot, 'shared'),
    },
    extensions: ['.tsx', '.ts', '.js', '.json'],
    modules: [path.join(here, 'node_modules'), path.join(gameRoot, 'node_modules'), 'node_modules'],
    fallback: {
      crypto: gameRequire.resolve('crypto-browserify'),
      stream: gameRequire.resolve('stream-browserify'),
      buffer: gameRequire.resolve('buffer/'),
      process: gameRequire.resolve('process/browser'),
      path: false,
      vm: gameRequire.resolve('vm-browserify'),
      querystring: gameRequire.resolve('querystring-es3'),
    },
  },
  resolveLoader: {
    modules: [path.join(here, 'node_modules'), path.join(gameRoot, 'node_modules'), 'node_modules'],
  },
};
