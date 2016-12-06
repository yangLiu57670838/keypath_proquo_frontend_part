'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('my.payments', {
        url: '/payments?returnToProjectId',
        params: {
          returnToProjectId: undefined,
        },
        views: {'payments' : {templateUrl: 'app/my/payments/payments.html',
          controller: 'PaymentsCtrl',
          controllerAs: 'vm'
        }},
        authenticated: true,
        data: {
          pageTitle: 'Payments'
        },
        resolve: {
          currentBusiness: function(Business) {
            return Business.mine().$promise;
          },
          currentUser: function(User) {
            return User.verifyBillingState().$promise;
          }
        }
      });
  });
