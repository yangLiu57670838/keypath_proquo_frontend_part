'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('agreement', {
        url: '/project/:projectId/agreement?sessionId',
        templateUrl: 'app/projects/agreement/agreement.html',
        controller: 'AgreementCtrl',
        controllerAs: 'vm',
        authenticate: true,
        data: {
          pageTitle : 'Agreement'
        }
      });
  });
