'use strict';

class SignupController {
  constructor(Auth, $state, $window, modalService, $stateParams) {
    this._Auth = Auth;
    this._$state = $state;
    this._$window = $window;
    this._ModalService = modalService;
    this.showTermsModal = this._ModalService.showTermsModal;

    if ($stateParams.email) {
      this.user = {
        email: $stateParams.email
      }
    }

    // If the user modified the URL or provided an incorrect campaignId just ignore it
    if ($stateParams.campaign && new RegExp("^[0-9a-fA-F]{24}$").test($stateParams.campaign)) {
      this.user = {
        campaignId: $stateParams.campaign
      }
    }
  }

  loginOauth(provider) {
    this._$window.location.href = '/auth/' + provider;
  }

  showLoginModal($event) {
    this._ModalService.showLoginModal($event, 'projects');
  }

  changeFieldValue(field, form) {
    if (form) {
      if (form[field] && form[field].$error && form[field].$error.mongoose) {
        delete form[field].$error.mongoose;
      }
      if (form.$error && form.$error.mongoose) {
        delete form.$error.mongoose;
      }
    }

    //remove server-side error when input value has been changed
    if (this.errors && this.errors[field]) {
      delete this.errors[field];
    }
  }

  register(form) {
    this.isSubmitting = true;
    if (form.$invalid) {
      this.isSubmitting = false;
      return;
    }

    this._Auth.createUser(this.user)
      .then(() => {
        this._$state.go('getstarted-welcome');
      })
      .catch(err => {
        err = err.data;
        this.errors = {};
        // Update validity of form fields that match the mongoose errors
        angular.forEach(err.errors, (error, field) => {
          form[field].$setValidity('mongoose', false);
          this.errors[field] = error.message;
        });
        this.isSubmitting = false;
      });
  }
}

angular
  .module(
    'digitalVillageApp'
  )
  .controller(
    'SignupCtrl'
    ,
    SignupController
  )
;
