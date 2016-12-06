'use strict';

(function() {
  function ToastService($mdToast) {
    return {
      show(message, actionCb, actionTitle) {
        const toastController = ['$scope', ($scope) => {
          if (actionCb && actionTitle) {
            $scope.actionTitle = actionTitle;
            $scope.actionCb = () => {
              actionCb();
              $mdToast.hide();
            };
          }

          $scope.toastContent = message;

          $scope.closeToast = () => {
            $mdToast.hide();
          };
        }];

        $mdToast.show({
          controller: toastController,
          templateUrl: 'app/ng/templates/notificationToast.html',
          position: 'top',
          hideDelay: 5000,
          highlightAction: true
        });
      }
    };
  }

  angular.module('digitalVillageApp')
    .factory('Toast', ToastService);
})();
