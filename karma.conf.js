// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function(config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    //frameworks: ['mocha', 'chai', 'sinon-chai', 'chai-as-promised', 'chai-things'],
    frameworks: ['mocha', 'chai', 'sinon-chai'],

    client: {
      mocha: {
        timeout: 5000 // set default mocha spec timeout
      }
    },

    // list of files / patterns to load in the browser
    files: [
      'node_modules/babel-polyfill/dist/polyfill.js',
      'client/assets/scripts/head.js',
      'client/assets/scripts/head/_modernizr-2.7.1.min.js',
      'client/assets/scripts/head/_match-media.js',
      'client/assets/scripts/head/_fixedfixed.js',
      'client/assets/scripts/head/_ie.js',
      'client/assets/scripts/head/_isReady.js',
      // bower:js
      'client/bower_components/jquery/dist/jquery.js',
      'client/bower_components/modernizr/modernizr.js',
      'client/bower_components/angular/angular.js',
      'client/bower_components/angular-i18n/angular-locale_en-au.js',
      'client/bower_components/angular-resource/angular-resource.js',
      'client/bower_components/angular-cookies/angular-cookies.js',
      'client/bower_components/angular-sanitize/angular-sanitize.js',
      'client/bower_components/angular-animate/angular-animate.js',
      'client/bower_components/angular-messages/angular-messages.js',
      'client/bower_components/angular-mocks/angular-mocks.js',
      'client/bower_components/angular-aria/angular-aria.js',
      'client/bower_components/angular-ui-router/release/angular-ui-router.js',
      'client/bower_components/ui-router-extras/release/ct-ui-router-extras.js',
      'client/bower_components/angular-validation-match/dist/angular-validation-match.min.js',
      'client/bower_components/angular-material/angular-material.js',
      'client/bower_components/angular-timeago/src/timeAgo.js',
      'client/bower_components/angular-load/angular-load.js',
      'client/bower_components/ddbreakpoints/lib/dd.breakpoints.js',
      'client/bower_components/enquire/dist/enquire.js',
      'client/bower_components/lodash/dist/lodash.compat.js',
      'client/bower_components/prism/prism.js',
      'client/bower_components/slick-carousel/slick/slick.min.js',
      'client/bower_components/velocity/velocity.js',
      'client/bower_components/velocity/velocity.ui.js',
      'client/bower_components/underscore/underscore.js',
      'client/bower_components/angular-scroll/angular-scroll.js',
      'client/bower_components/flow.js/dist/flow.js',
      'client/bower_components/ng-flow/dist/ng-flow.js',
      'client/bower_components/angular-read-more/dist/readmore.min.js',
      'client/bower_components/angular-slick/dist/slick.js',
      'client/bower_components/moment/moment.js',
      'client/bower_components/filepicker-js-bower/filepicker.min.js',
      'client/bower_components/angular-local-storage/dist/angular-local-storage.js',
      'client/bower_components/angular-credit-cards/release/angular-credit-cards.js',
      'client/bower_components/mdPickers/dist/mdPickers.min.js',
      'client/bower_components/pubnub/web/dist/pubnub.min.js',
      'client/bower_components/pubnub-angular/dist/pubnub-angular.min.js',
      'client/bower_components/angular-price-format/js/jquery-price-format.js',
      'client/bower_components/angular-price-format/js/angular-price-format.js',
      'client/bower_components/SHA-1/sha1.js',
      'client/bower_components/angulartics/src/angulartics.js',
      'client/bower_components/angulartics-google-analytics/lib/angulartics-google-analytics.js',
      // endbower
      'client/assets/scripts/script.js',
      'client/app/app.js',
      'client/{app,components}/**/*.module.js',
      'client/{app,components}/**/*.js',
      'client/{app,components}/**/*.html'
    ],

    preprocessors: {
      '**/*.html': 'ng-html2js',
      'client/{app,components}/**/*.js': ['babel']
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'client/'
    },

    babelPreprocessor: {
      options: {
        sourceMap: 'inline',
        blacklist: ['useStrict'],
        optional: [
          'es7.classProperties'
        ]
      },
      filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    },

    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,

    // reporter types:
    // - dots
    // - progress (default)
    // - spec (karma-spec-reporter)
    // - junit
    // - growl
    // - coverage
    reporters: ['spec'],

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false
  });
};
