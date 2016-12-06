'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {

    $stateProvider
      .state('my', {
        templateUrl: 'app/my/my.html',
        controller: 'MyCtrl',
        controllerAs: 'myCtrl',
        data: {
          pageTitle: 'My Proquo'
        },
        abstract: true,
        authenticate: true
      });
  });
