import path from 'path';
import { fileURLToPath } from 'url'; // Import fileURLToPath
import HtmlWebpackPlugin from 'html-webpack-plugin';

// Derive __dirname using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
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
        // Use the derived __dirname
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
