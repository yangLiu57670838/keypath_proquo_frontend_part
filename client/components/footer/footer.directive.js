'use strict';

angular.module('digitalVillageApp')
  .directive('mainFooter', function () {
    return {
      templateUrl: 'components/footer/footer.html',
      restrict: 'E',
      controller: function ($scope, $location, Config, Auth, $state, modalService) {
        var self = this;

        self.showFooter = true;

        Config.get('APP_VERSION').then(value => {
          self.appVersion = value;
        });

        self.setCurrentUser = function () {
          Auth.getCurrentUser(usr=> {
            if (usr && usr._id) {
              self.currentUser = usr;
            } else {
              self.currentUser = undefined;
            }
          });
        };

        self.startBusiness = function() {
          return modalService.showStartBusinessOptionsModal();
        };


        // Set the current user
        self.setCurrentUser();

        // Change on login or logout events
        Auth.onLogin(self.setCurrentUser);
        Auth.onLogout(self.setCurrentUser);
        Auth.onNewUser(self.setCurrentUser);

      },
      controllerAs: 'vm'
    };
  });
