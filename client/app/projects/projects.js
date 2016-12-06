'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('projects', {
        url: '/projects/:projectId',
        templateUrl: 'app/projects/projects.html',
        controller: 'ProjectsCtrl',
        controllerAs: 'vm',
        sticky: true,
        authenticate: true,
        data: {
          pageTitle : 'Projects'
        },
        resolve: {
          currentUser: (Auth) => Auth.getCurrentUser().$promise
        }
      });
  });
