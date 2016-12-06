'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('quote', {
        url: '/project/:projectId/quote',
        templateUrl: 'app/projects/quote/quote.html',
        controller: 'QuoteCtrl',
        controllerAs: 'vm',
        authenticate: true,
        data: {
          pageTitle : 'Quote'
        }
      });
  });
