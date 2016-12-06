'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('getstarted', {
        url: '/getstarted/signup?email&campaign',
        templateUrl: 'app/getstarted/signup.html',
        controller: 'SignupCtrl',
        controllerAs: 'vm',
        scope: {}
      })
      .state('getstarted-welcome', {
        url: '/getstarted/welcome',
        templateUrl: 'app/getstarted/welcome.html',
        controller: 'WelcomeCtrl',
        controllerAs: 'vm',
        authenticate: true,
        scope: {}
      })
      .state('getstarted-nameinfo', {
        url: '/getstarted/nameinfo',
        templateUrl: 'app/getstarted/nameInfo.html',
        controller: 'NameInfoCtrl',
        controllerAs: 'vm',
        authenticate: true,
        scope: {}
      })
      .state('getstarted-selection', {
        url: '/getstarted/selection',
        templateUrl: 'app/getstarted/regoSelection.html',
        controller: 'RegoSelectionCtrl',
        controllerAs: 'vm',
        authenticate: true,
        scope: {}
      })
      .state('getstarted-buyer', {
        url: '/getstarted/buyer',
        templateUrl: 'app/getstarted/buyer/buyer.html',
        controller: 'GetStartedBuyerCtrl',
        authenticate: true,
        controllerAs: 'vm',
        scope: {},
        resolve: {
          myBusiness: (Business) => Business.mine().$promise
        }
      })
      .state('getstarted-seller', {
        url: '/getstarted/seller',
        templateUrl: 'app/getstarted/seller/seller.html',
        controller: 'GetStartedSellerCtrl',
        controllerAs: 'vm',
        authenticate: true,
        scope: {}
      })
      .state('getstarted-swap', {
        url: '/getstarted/swap',
        templateUrl: 'app/getstarted/seller/seller.html',
        controller: 'GetStartedSellerCtrl',
        controllerAs: 'vm',
        authenticate: true,
        scope: {}
      });
  });
