'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('itdbView', {
        url: '/project/:projectId/itdbview',
        templateUrl: 'app/projects/itdbView/itdbView.html',
        controller: 'ItdbViewCtrl',
        controllerAs:'vm'
      });
  });
