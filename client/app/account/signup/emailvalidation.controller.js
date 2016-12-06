'use strict';

class EmailValidationController {
  errors = {};
  validated = false;
  processed = false;


  constructor($scope, $timeout, $location, $interval, $mdToast, $state, UserToken, Auth) {
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.location = $location;
    this.countDown = -1;

    UserToken.validateEmail({ token: $state.params.token }).$promise.then( () => {
      this.validated = true;
      this.processed = true;
      Auth.refresh().then(() => {
        this.redirect($scope, $timeout, $interval, $location, 5);
      });
    }).catch(err => {
      console.log(err);
      this.errors = err.data.errors;
      this.validated = false;
      this.processed = true;
    });
  }

  redirect($scope, $timeout, $interval, $location, sec) {
    this.countDown = sec;
    $timeout(() => {
      const timer = $interval(() => {
        if (this.countDown > 0) {
          this.countDown--;
        } else {
          $interval.cancel(timer);
          $location.path('/home');
        }
      }, 1000);
    }, 1000);
  };

}

angular.module('digitalVillageApp')
  .controller('EmailValidationController', EmailValidationController);

