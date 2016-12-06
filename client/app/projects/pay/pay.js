'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('pay', {
        url: '/project/:projectId/pay/deposit?sessionId',
        templateUrl: 'app/projects/pay/pay.html',
        controller: 'PayCtrl',
        controllerAs: 'vm',
        authenticate: true,
        data: {
          pageTitle : 'Pay Deposit',
          actionRef : 'payDeposit',
          paymentModelName: 'depositPayment'
        },
        resolve: {
          PP_SCRIPT_URL: function($stateParams, Config) {
            return Config.get('PP_ESCROW_SCRIPT_URL');
          },
          checkPayment: function($stateParams, Project) {
            // Don't care about the response at this stage, as long as it gets called
            return new Promise((resolve, reject) => {
              Project.checkDeposit({id: $stateParams.projectId}).$promise.then(
                res => {
                  resolve(res);
                },
                err => {
                  resolve(err);
                }
              );
            });
          },
          paymentSession: function($stateParams, Project, PaymentService, $q) {
            // This is required to be obtained prior to loading the screen with the js lib and elements.
            return Project.get({id: $stateParams.projectId}).$promise.then(project => {
              if (project.status === 'cash.deposit-pending' || project.status === 'swap.deposit-pending') {
                return PaymentService.session({
                  itemId: project.depositPayment._id,
                  paymentType: project.depositPayment.paymentType
                }).$promise;
              } else {
                return $q.reject;
              }
            });
          }
        }
      })
      .state('finalPayment', {
        url: '/project/:projectId/pay/final?sessionId',
        templateUrl: 'app/projects/pay/finalPayment.html',
        controller: 'PayCtrl',
        controllerAs: 'vm',
        authenticate: true,
        data: {
          pageTitle : 'Final Payment',
          actionRef : 'payFinalPayment',
          paymentModelName: 'finalPayment'
        },
        resolve: {
          PP_SCRIPT_URL: (Config) => Config.get('PP_EXPRESS_SCRIPT_URL'),
          paymentSession: ($stateParams, Project, PaymentService, $q) =>
            Project.checkFinalPayment({id: $stateParams.projectId}).$promise
              .catch(err => err)  // ignore errors
              .then(res =>
                // This is required to be obtained prior to loading the screen with the js lib and elements.
                Project.get({id: $stateParams.projectId}).$promise.then(project => {
                  if (project.status === 'cash.final-payment-pending' || project.status === 'swap.final-payment-pending') {
                    return PaymentService.session({
                      itemId: project.finalPayment._id,
                      paymentType: project.finalPayment.paymentType
                    }).$promise;
                  } else {
                    return $q.reject;
                  }
                })
              )
        }
      });
  });
