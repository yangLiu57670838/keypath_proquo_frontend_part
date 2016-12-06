'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('how', {
        url: '/how',
        templateUrl: 'app/how/how.html',
        controller: 'HowCtrl',
        controllerAs: 'vm'
      });
  });
