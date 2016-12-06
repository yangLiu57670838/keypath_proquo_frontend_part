'use strict';

angular.module('digitalVillageApp')
  .directive('contentHeader', function () {
    return {
      templateUrl: 'components/content-header/content-header.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.heading = attrs.heading;
      }
    };
  });
