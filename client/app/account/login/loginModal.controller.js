'use strict';

class LoginModalController {

  constructor(Auth,
              GetStartedStateService,
              $scope,
              $state,
              $stateParams,
              $mdDialog,
              $mdToast,
              $window,
              localStorageService,
              toStateName,
              toStateParams,
              $location) {
    this.user = {};
    this.errors = {};
    this.submitted = false;
    this.Auth = Auth;
    this.GetStartedStateService = GetStartedStateService;
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$mdDialog = $mdDialog;
    this.$mdToast = $mdToast;
    this.$window = $window;
    $scope.close = this.$mdDialog.hide;
    this._toState = {name: toStateName, params: toStateParams};
    this.localStorageService = localStorageService;
    if($location.search().errMsg) {
      this.errors.other = $location.search().errMsg;
      $location.url($location.path());
    }

  }

  loginOauth(provider) {
    // TODO Set state required to nav to in local store
    // If no state or state params to go to provided then user current
    if (this.localStorageService.isSupported) {
      let toState;
      if (this._toState && this._toState.name) {
        toState = this._toState;
      } else if (this.$state.current.name!=='home' && this.$state.current.name!=='signup') {
        toState = {name: this.$state.current.name, params: this.$stateParams};
      }

      if (toState) {
        this.localStorageService.set('toState', toState);
      }
    }

    this.$window.location.href = '/auth/' + provider;
  }

  login(form) {
    this.submitted = true;

    if (form.$valid) {
      this.Auth.login(this.user)
        .then(() => this.GetStartedStateService.getStartedState(true))
        .then(getStartedState => {
          if (getStartedState) {
            this._toState = { name: getStartedState };
          }

          // close dialog
          this.$mdDialog.hide();

          var welcomeToastController = function ($scope, $mdToast) {
            $scope.toastContent = "Welcome back to Proquo";

            $scope.closeToast = function() {
              $mdToast.hide();
            };
          };

          if (this._toState && this._toState.name) {
            this.$state.go(this._toState.name, this._toState.params, { reload: true });
          } else {
            const currentState = this.$state.current;

            if (['getstarted', 'home'].includes(currentState.name)) {
              this.$state.go('init');
            } else if (!currentState.abstract) {
              // $state.reload() doesn't work if user has entered a URL directly into the location bar (i.e. when currentState.abstract is true)
              this.$state.reload();
            }
          }

          // notification
          this.$mdToast.show({
            controller: welcomeToastController,
            templateUrl: 'app/ng/templates/notificationToast.html',
            position: 'top',
            hideDelay: 5000,
            highlightAction: true
          });
        })
        .catch(err => {
          this.errors.other = err.message;
        });
    }
  }

  clearServerErrorMsg(){
    this.errors.other = null;
  }
}

angular.module('digitalVillageApp')
  .controller('LoginModalController', LoginModalController);
