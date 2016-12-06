/**
 * Main application file
 */

'use strict';

import bluebird from 'bluebird';
import express from 'express';
import http from 'http';
import moment from 'moment';
import mongoose from 'mongoose';
import config from './config/environment';

moment.locale('en-AU');

mongoose.Promise = bluebird;

process.on('unhandledRejection', function(reason, p){
  console.log('\x1b[31mPossibly Unhandled Rejection at: Promise ', p, ' reason: ', reason);
  // application specific logging here
});

// Connect to MongoDB
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err) {
  console.error('MongoDB connection error: ' + err);
  process.exit(-1);
});

// Populate databases with sample data
if (config.seedDB) { require('./config/seed'); }

// Setup server
var app = express();
var server = http.createServer(app);
require('./config/express')(app);
require('./routes')(app);

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

setImmediate(startServer);

// Expose app
exports = module.exports = app;
