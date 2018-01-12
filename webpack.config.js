const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
<<<<<<< HEAD
  entry: {
    bundle: './js/demo.js',
    browserBenchmark: './js/browser-benchmark.js',
  },
  output: {
    filename: '[name].js',
=======
  entry: './js/demo.js',
  output: {
    filename: 'bundle.js',
>>>>>>> master
    path: path.resolve(__dirname, 'dist')
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'js'),
        use: {
          loader: 'babel-loader'
        }

      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(['dist']),
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
