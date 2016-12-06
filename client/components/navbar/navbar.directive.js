'use strict';

angular.module('digitalVillageApp')
  .directive('navBar', function () {
    return {
      templateUrl: 'components/navbar/navbar.html',
      restrict: 'E',
      replace: true,
      controller: 'NavbarCtrl',
      controllerAs: 'navCtrl'
    };
  });
