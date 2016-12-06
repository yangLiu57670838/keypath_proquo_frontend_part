'use strict';

angular.module('digitalVillageApp')
  .config(function($stateProvider) {
    $stateProvider
      .state('logout', {
        url: '/logout?referrer',
        referrer: 'home',
        template: '',
        controller: function($state, Auth, $mdToast) {
          var referrer = $state.params.referrer ||
                          $state.current.referrer ||
                          'home';
          Auth.logout();
          $state.go(referrer);
          var welcomeToastController = function ($scope, $mdToast) {
            $scope.toastContent = "Successfully logged out";

            $scope.closeToast = function() {
              $mdToast.hide();
            };
          };
          $mdToast.show({
            controller: welcomeToastController,
            templateUrl: 'app/ng/templates/notificationToast.html',
            position: 'top',
            hideDelay: 5000,
            highlightAction: true
          });
        }
      })
      .state('socialSignFailure', {
        url: '/socialSignFailure',
        template: '',
        controller: function($state, $location) {
          $state.go('getstarted', { errMsg: $location.search().errMsg });
        }
      })
      .state('forgotpwd', {
        url: '/forgotpwd',
        templateUrl: 'app/account/forgotpassword/forgotpassword.html',
        controller: 'ForgotPasswordController',
        controllerAs: 'vm'
      })
      .state('resetpwd', {
        url: '/resetpwd',
        templateUrl: 'app/account/resetpassword/resetpassword.html',
        controller: 'ResetPasswordController',
        controllerAs: 'vm'
      })
      .state('emailvalidation', {
        url: '/signup/emailvalidation?token',
        templateUrl: 'app/account/signup/emailvalidation.html',
        controller: 'EmailValidationController',
        controllerAs: 'vm'
      })
      .state('my.settings', {
        url: '/settings',
        views: {
          'settings' : {
            templateUrl: 'app/account/settings/settings.html',
            controller: 'SettingsController',
            controllerAs: 'vm'
          }
        },
        authenticate: true,
        data: {
          pageTitle: 'Settings'
        },
        sticky: true
      });
  })
  .run(function($rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, current) {
      if (next.name === 'logout' && current && current.name && !current.authenticate) {
        next.referrer = current.name;
      }
    });
  });
