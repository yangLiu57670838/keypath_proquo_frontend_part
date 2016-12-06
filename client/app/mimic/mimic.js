'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('mimic', {
        url: '/mimic',
        templateUrl: 'app/mimic/mimic.html',
        controller: 'MimicCtrl'
      });
  });
