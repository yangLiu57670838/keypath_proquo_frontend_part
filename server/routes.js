/**
 * Main application routes
 */

'use strict';

import express from 'express';
import favicon from 'serve-favicon';
import morgan from 'morgan';
import errorHandler from 'errorhandler';

import config from './config/environment';
import errors from './components/errors';
import fs from 'fs';
import path from 'path';

export default function(app) {
  const env = app.get('env');
  const appPath = app.get('appPath');

  // ensure we always serve the dynamically generated index.html, not the original
  app.get('/', getIndexHtml);
  app.get('/index.html', getIndexHtml);

  switch (env) {
    case 'production':
      app.use(favicon(path.join(config.root, 'client', 'favicon.ico')));
      app.use(express.static(appPath));
      app.use(morgan('dev'));
      break;
    case 'development':
    case 'test':
      app.use(express.static(path.join(config.root, '.tmp')));
      app.use(express.static(appPath));
      app.use(morgan('dev'));
      app.use(errorHandler()); // Error handler - has to be last
      break;
    default:
      console.error('unsupported environment', env);
      process.exit(1);  // no point continuing as no static content will be available
  }

  // Insert routes below
  app.use('/api/invitationtodobusinesses', require('./api/invitationtodobusiness'));
  app.use('/api/mimic', require('./api/mimic'));
  app.use('/api/requestforquotes', require('./api/requestforquote'));
  app.use('/api/reviews', require('./api/review'));
  app.use('/api/messages', require('./api/message'));
  app.use('/api/chats', require('./api/chat'));
  app.use('/api/payments', require('./api/payment'));
  app.use('/api/projects', require('./api/project'));
  app.use('/api/config', require('./api/config'));
  app.use('/api/tokens', require('./api/token'));
  app.use('/api/abn', require('./api/abn'));
  app.use('/api/categories', require('./api/category'));
  app.use('/api/business', require('./api/business'));
  app.use('/api/platformhistory', require('./api/platformhistory'));
  app.use('/api/qualifications', require('./api/qualification'));
  app.use('/api/profiles', require('./api/profile'));
  app.use('/api/notifications', require('./api/notification'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/campaigns', require('./api/campaign'));

  app.use('/auth', require('./auth'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*').get(getIndexHtml);

  // index.html is treated as a template into which the app's google analytics track ID is substituted
  const indexHtmlPath = path.join(appPath, 'index.html');
  const indexHtml = fs.readFileSync(indexHtmlPath, { encoding: 'UTF-8' })
    .replace('GOOGLE_ANALYTICS_TRACKING_ID', `'${process.env.GOOGLE_ANALYTICS_TRACKING_ID}'`);  // substitute in the appropriate google analytics ID
  const indexHtmlLastModified = fs.statSync(indexHtmlPath).mtime.toUTCString(); // use the underlying file modification time to avoid unnecessarily trashing browser caches

  function getIndexHtml(req, res) {
    res.set('Content-Type', 'text/html; charset=UTF-8');
    res.set('Cache-Control', 'public, max-age=7200');
    res.set('Last-Modified', indexHtmlLastModified);
    res.send(indexHtml);
  }
}
