'use strict';

angular.module('digitalVillageApp', [
    'digitalVillageApp.auth',
    'digitalVillageApp.admin',
    'digitalVillageApp.constants',
    'ngCookies',
    'ngLocale',
    'ngResource',
    'ngSanitize',
    'ui.router',
    'ct.ui.router.extras',
    'validation.match',
    'ngAnimate',
    'ngAria',
    'ngMaterial',
    'ngMessages',
    'yaru22.angular-timeago',
    'angularLoad',
    'duScroll',
    'flow',
    'hm.readmore',
    'slick',
    'LocalStorageModule',
    'credit-cards',
    'mdPickers',
    'pubnub.angular.service',
    'angular-price-format',
    'angulartics',
    'angulartics.google.analytics'
  ])
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, localStorageServiceProvider, $compileProvider) {

    $compileProvider.debugInfoEnabled(false);

    $urlRouterProvider.otherwise(($injector) => {
      var $state = $injector.get("$state");
      $state.go("home");
    });

    $stateProvider
      .state('init', {
        url: '/init',
        controller: function($state, localStorageService, Config) {
          var self = this;

          // Determine if user should be navigated to a state/params after social login
          // Unless state is setup
          if (localStorageService.isSupported) {
            var toState = localStorageService.get('toState');
            if (toState && toState.name) {
              localStorageService.remove('toState');
              $state.go(toState.name, toState.params);
            } else {
              $state.go('skill-search');
            }
          } else {
            $state.go('skill-search');
          }
        }
      });

    $locationProvider.html5Mode(true);

    localStorageServiceProvider.setPrefix('digiVllage');
  })
  .config(['$locationProvider', function($locationProvider) {

    $locationProvider.html5Mode({
      enabled: true,
      rewriteLinks: false,
      requireBase: false
    });

  }])
  .config(['$mdThemingProvider', function($mdThemingProvider) {

    /* default primary */
    var primary = $mdThemingProvider.extendPalette('green', {
      '500': '87BEB4',
      'accent': '259b24'
    });
    $mdThemingProvider.definePalette('primary-color', primary);
    $mdThemingProvider.theme('default').primaryPalette('primary-color'); //.accentPalette('green');

    // error red
    var error = $mdThemingProvider.extendPalette('red', {
      '500': 'D77841'
    });
    $mdThemingProvider.definePalette('error-color', error);
    $mdThemingProvider.theme('red').primaryPalette('error-color');

    //
    $mdThemingProvider.theme('black');

    // secondary color blue
    var secondary = $mdThemingProvider.extendPalette('blue', {
      '500': '41648C'
    });
    $mdThemingProvider.definePalette('secondary-color', secondary);
    $mdThemingProvider.theme('blue').primaryPalette('secondary-color');


    $mdThemingProvider.theme('green').primaryPalette('green');

    $mdThemingProvider.alwaysWatchTheme(true);

  }])
  .run(function($rootScope, $state, Pubnub, Config, $window) {
    $rootScope.$on('$stateNotFound',
      function(event, unfoundState) {
        //console.log(unfoundState.to); // "lazy.state"
        //console.log(unfoundState.toParams); // {a:1, b:2}
        //console.log(unfoundState.options); // {inherit:false} + default options
        $state.go('not-implemented');
      });

    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, from, fromParams) {
      if (toState.data && toState.data.pageTitle) {
        $rootScope.pageTitle = ' | ' + toState.data.pageTitle;
      }
      $rootScope.previousState = from;
      $rootScope.previousParams = fromParams;
    });

    // Promise pay widget event listener to convert to angular
    $window.addEventListener("message", e => {
      const message = typeof e.data === 'object' ? e.data : JSON.parse(e.data);
      if (message !== null && message !== "" && typeof message === 'object') {
        if (message.promisepay !== null && message.promisepay !== "" && typeof message.promisepay === "string") {
          if (message.promisepay == 'open-popup') {
            $rootScope.$broadcast('pp-open-popup', message);
          }
          if (message.promisepay == 'close-popup') {
            $rootScope.$broadcast('pp-close-popup', message);
          }
        }
      }
    }, false);
  });
