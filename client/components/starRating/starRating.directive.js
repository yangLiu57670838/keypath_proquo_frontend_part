'use strict';

angular.module('digitalVillageApp')
  .directive('starRating', function () {
    return {
      templateUrl: 'components/starRating/starRating.html',
      restrict: 'EA',
      replace: true,
      scope: {
        'rating' : '=',
        'ratingDisabled' : '='
      }
    };
  });
