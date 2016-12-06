'use strict';

angular.module('digitalVillageApp')
  .controller('PortfolioCtrl', function ($scope, $mdDialog, $mdMedia, item) {
    $scope.item = item;
    $scope.cancel = function() {
      $mdDialog.cancel();
    };
  });
