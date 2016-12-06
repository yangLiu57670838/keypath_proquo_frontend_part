'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('privacy', {
        url: '/privacy',
        templateUrl: 'app/privacy/privacy/privacy.html',
        controller: 'PrivacyCtrl',
        controllerAs: 'privacyCtrl'
      });
  });
