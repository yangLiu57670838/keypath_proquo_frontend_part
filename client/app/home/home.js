'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('home', {
        url: '/home?logoutSuccessful&popLoginModal&errMsg',
        templateUrl: 'app/home/home.html',
        controller: 'HomeController',
        controllerAs: 'homeCtrl',
        data: {
          pageTitle: 'Home'
        }
      });
  });
