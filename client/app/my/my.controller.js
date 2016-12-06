'use strict';

angular.module('digitalVillageApp')
  .controller('MyCtrl', function ($scope, $state, $rootScope) {
    var self = this;

    self.currentState = $state.current;

    $rootScope.$on('$stateChangeSuccess',
      function(event, toState){
        self.currentState = toState;
      });
  });
