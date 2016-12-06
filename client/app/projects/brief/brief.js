'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('briefCreate', {
        url: '/project/brief?engageWith&proquote',
        templateUrl: 'app/projects/brief/brief.html',
        controller: 'BriefCtrl',
        controllerAs: 'vm',
        authenticate: true,
        data: {
          pageTitle : 'Create Brief'
        }
      })
      .state('brief', {
        url: '/project/:projectId/brief?proquote',
        templateUrl: 'app/projects/brief/brief.html',
        controller: 'BriefCtrl',
        controllerAs: 'vm',
        authenticate: true,
        data: {
          pageTitle : 'Edit Brief'
        }
      });
  });
