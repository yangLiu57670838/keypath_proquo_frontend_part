'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('createItdb', {
        url: '/project/createitdb',
        templateUrl: 'app/projects/createItdb/createItdb.html',
        controller: 'CreateItdbCtrl',
        controllerAs:'vm',
        authenticate: true
      })
      .state('createItdbEdit', {
        url: '/project/:projectId/createitdb?hashId=',
        templateUrl: 'app/projects/createItdb/createItdb.html',
        controller: 'CreateItdbCtrl',
        controllerAs:'vm',
        authenticate: true
      });
  });
