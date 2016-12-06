'use strict';

class NameInfoController {
  constructor(Auth, $state, User) {
    Auth.getCurrentUser((user) => {
      this.init($state, User, user);
    });
  }

  init($state, User, user) {
    this._User = User;
    this._$state = $state;
    this.user = user;
  }

  submit(form) {
    this.isSubmitting = true;
    if (form.$invalid) {
      this.isSubmitting = false;
      return;
    }
    this._User.addName({id: this.user._id}, this.user).$promise.then(() => {
      this._$state.go('getstarted-selection');
    }, error => {
      this.isSubmitting = false;
    });
  }
}

angular.module('digitalVillageApp')
  .controller('NameInfoCtrl', NameInfoController);
