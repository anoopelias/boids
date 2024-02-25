const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    bundle: './js/bootstrap.js',
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
        include: path.resolve(__dirname, 'js'),
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
  ]
};
