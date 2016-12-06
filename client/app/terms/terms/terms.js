'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('terms', {
        url: '/terms',
        templateUrl: 'app/terms/terms/terms.html',
        controller: 'TermsCtrl',
        controllerAs: 'termsCtrl'
      });
  });
