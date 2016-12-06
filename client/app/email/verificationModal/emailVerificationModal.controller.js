/**
 * Created by jzhang on 14/06/2016.
 */
'use strict';

class EmailVerificationModalController {
  currentUser = undefined;
  emailInput = false;
  processing = false;
  emailSent = false;
  errors = {};

  constructor($scope, $mdDialog, User) {
    this.$mdDialog = $mdDialog;
    this.User = User;
    User.get().$promise.then( (user) => {
      this.currentUser = user;
    });
  }

  clearErrors() {
    this.errors = {};
  }

  showEmailInput() {
    this.emailInput = true;
    this.emailSent = false;
  }

  cancel() {
    this.$mdDialog.cancel();
  }

  resendVerification() {
    this.processing = true;
    this.User.validationEmail({ id: this.currentUser._id }, {user: {email: this.currentUser.email}}).$promise.then( () => {
      this.processing = false;
      this.emailSent = true;
    }).catch(err => {
      this.processing = false;
      this.errors = err.data.errors;
    });
};

}

angular.module('digitalVillageApp')
  .controller('EmailVerificationModalCtrl', EmailVerificationModalController);
