'use strict';

/**
 * @ngdoc directive
 * @name digitalVillage.directive:searchResult
 * @description
 * # searchResult
 * directive for an individual search result card
 */
angular.module('digitalVillageApp').directive('searchResult',
  function () {
    return {
      restrict: 'AE',
      scope: {
        result: '=',
        searchType: '=',
        ratingDisabled: '=',
        skillsExpandLimit: '='
      },
      templateUrl: 'app/ng/templates/searchResult.html'
    };
  });
