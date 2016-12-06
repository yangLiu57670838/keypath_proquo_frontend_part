'use strict';

angular.module('digitalVillageApp.auth', [
  'digitalVillageApp.constants',
  'digitalVillageApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
