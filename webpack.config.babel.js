import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  entry: {
    bundle: './js/bootstrap.js',
    wasmBundle: './js/wasm-bootstrap.js',
    browserBenchmark: './js/browser-benchmark.js',
  },
  experiments: {
    asyncWebAssembly: true,
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(import.meta.dirname, 'js'),
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }]
            ]
          }
        }
      }
    ]
  },
  output: {
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
        template: 'index.html',
        favicon: 'favicon.ico',
        chunks: ['bundle'],
    }),
    new HtmlWebpackPlugin({
        filename: 'benchmark.html',
        template: 'benchmark.html',
        chunks: ['browserBenchmark'],
    }),
    new HtmlWebpackPlugin({
      filename: 'wasm-test.html',
      template: 'benchmark.html',
      chunks: ['wasmBundle'],
    }),
  ]
};
