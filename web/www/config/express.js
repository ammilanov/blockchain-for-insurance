'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import compression from 'compression';
import i18nConfig from './i18n';

export default function (app) {
  const isDev = app.get('env') === 'development';

  // Configure Express
  app.set('view engine', 'pug');
  app.use(compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    }
  }));
  app.use(require('cookie-parser')());
  app.use(bodyParser.urlencoded({
    extended: true
  }));
  app.use(bodyParser.json());

  // Serve static files with lower priority
  app.use(express.static(path.join(__dirname, '../..', 'static')));

  if (isDev) {
    const webpack = require('webpack');
    const webpackConfig = require('../../webpack.config.dev').default;
    const compiler = webpack(webpackConfig);
    // Configure logging
    app.use(morgan('dev'));
    // Configure webpack
    app.use(require('webpack-dev-middleware')(compiler, {
      noInfo: false,
      publicPath: webpackConfig.output.publicPath
    }));
    app.use(require('webpack-hot-middleware')(compiler));
  } else {
    app.use(express.static(path.join(__dirname, '../..', 'dist')));
  }

  // Set up internationalization for the backend
  i18nConfig(app);

  // Set up security features if running in the cloud
  if (process.env.VCAP_APPLICATION) {
    require('./security').default(app);
  }
}
