'use strict';

(function () {

  angular.module('digitalVillageApp.auth')
    .run(function ($rootScope, Auth, User, Toast, modalService) {
      let deregisterEmailValidationListener;

      registerEmailValidator();
      Auth.onLogin(registerEmailValidator); // ensure that we start checking when a (possibly new) user logins in

      // Show validate email message on every page after login if user is not validated via email.
      function registerEmailValidator() {
        if (deregisterEmailValidationListener) return;

        deregisterEmailValidationListener = $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
          Auth.isLoggedIn(loggedIn => {
            if (!loggedIn) return;

            User.get().$promise.then(currentUser => {
              if (currentUser.emailValidated) {
                deregisterEmailValidation();  // no need to check any more
              } else if (toState.url && !(toState.url === '/init' || toState.url.startsWith('/getstarted') || toState.url.startsWith('/signup'))){
                Toast.show("Uh-oh. It seems that your registration is not verified yet.",
                  modalService.showEmailVerificationModal, "Resend verification email?");
              }
            });
          });
        });
      }

      function deregisterEmailValidation() {
        if (deregisterEmailValidationListener) {
          deregisterEmailValidationListener();
          deregisterEmailValidationListener = undefined;
        }
      }
    })
    .run(function (Auth, StateChangeApprovalService, modalService) {
      // Redirect to login if route requires auth and the user is not logged in, or doesn't have required role
      StateChangeApprovalService.addApprover(function (next, nextParams) {
        if (!next.authenticate) {
          return true;
        }

        if (typeof next.authenticate === 'string') {
          return Auth.hasRole(next.authenticate, _.noop).then(has => {
            if (has) {
              return true;
            }

            return Auth.isLoggedIn(_.noop).then(is => {
              if (is) {
                return 'home';
              } else {
                modalService.showLoginModal(null, next.name, nextParams);
                return false;
              }
            });
          });
        } else {
          return Auth.isLoggedIn(_.noop).then(is => {
            if (is) {
              return true;
            }

            modalService.showLoginModal(null, next.name, nextParams);
            return false;
          });
        }
      });
    });
})();
