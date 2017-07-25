import webpack from 'webpack';
import { resolve } from 'path';

export default {
  devtool: 'source-map',
  entry: {
    'common': [
      'event-source-polyfill',
      'babel-polyfill',
      'isomorphic-fetch',
      'webpack-hot-middleware/client?reload=true', //note that it reloads the page if hot module reloading fails.
      resolve(__dirname, 'src/common')
    ],
    'shop': resolve(__dirname, 'src/shop/index'),
    'police': resolve(__dirname, 'src/police/index'),
    'repair-shop': resolve(__dirname, 'src/repair-shop/index'),
    'insurance': resolve(__dirname, 'src/insurance/index'),
    'block-explorer': resolve(__dirname, 'src/block-explorer/index')
  },
  target: 'web',
  output: {
    path: resolve(__dirname, 'dist'), // Note: Physical files are only output by the production build task `npm run build`.
    publicPath: '/',
    filename: '[name].bundle.js'
  },
  devServer: {
    contentBase: resolve(__dirname, 'src')
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin({
      debug: true
    }),
    new webpack.NoEmitOnErrorsPlugin({
      debug: true
    })
  ],
  module: {
    rules: [
      { test: /\.js$/, use: ['babel-loader'] },
      { test: /(\.css)$/, use: ['style-loader', 'css-loader', 'postcss-loader'] },
      {
        test: /(\.scss)$/, use: [
          'style-loader', 'css-loader', 'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              includePaths: [
                resolve(__dirname, 'node_modules/normalize-scss/sass')
              ]
            }
          }
        ]
      },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
      { test: /\.(woff|woff2)$/, use: 'url?prefix=font/&limit=5000' },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=application/octet-stream' },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, use: 'url-loader?limit=10000&mimetype=image/svg+xml' }
    ]
  }
};
