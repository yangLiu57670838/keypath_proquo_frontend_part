'use strict';

// Set default node environment to development
var env = process.env.NODE_ENV = process.env.NODE_ENV || 'development';

if (env === 'development' || env === 'test') {
  // Register the Babel require hook
  require('babel-core/register');
}

// ES6 polyfills are only installed automatically when using babel-node
try {
  require('babel-polyfill');
} catch (err) {
  if (err.message != "only one instance of babel-polyfill is allowed") {
    console.log("babel-polyfill load error:" + err.message);
    process.exit(1);
  }

  // otherwise, polyfill was already loaded: must be running babel-node
}

// Export the application
exports = module.exports = require('./app');
