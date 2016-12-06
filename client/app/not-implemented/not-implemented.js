'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('not-implemented', {
        url: '/NotYetImplemented',
        templateUrl: 'app/not-implemented/not-implemented.html',
        controller: 'NotImplementedCtrl'
      });
  });
