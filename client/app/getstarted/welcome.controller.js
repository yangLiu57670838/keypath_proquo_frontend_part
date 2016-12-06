'use strict';

class WelcomeController {
  constructor($state, $scope, $interval) {
    this.init($state, $scope, $interval);
  }

  init($state, $scope, $interval) {
    this._$state = $state;
    this._$scope = $scope;
    this._$interval = $interval;
    //5 seconds counting logic
    let timeUntilRedirect = 5; // seconds

    const formatTime = () => {
      this.humanTimeUntilRedirect = `in ${timeUntilRedirect} second${timeUntilRedirect !== 1 ? 's' : ''}`;
    };

    formatTime();
    const countdown = $interval(() => {
      timeUntilRedirect--;
      formatTime();
    }, 1000, timeUntilRedirect);
    countdown.then(() => {
      this._$state.go("getstarted-nameinfo");
    });

    // 1. ensure that hitting the browser's back button cancels the redirect.
    // 2. the multi-step-container creates this controller twice in short succession (urgh!): ensure that the first, phantom controller is cleaned up.
    this._$scope.$on('$destroy', () => this._$interval.cancel(countdown));
  }
}

angular.module('digitalVillageApp')
  .controller('WelcomeCtrl', WelcomeController);
