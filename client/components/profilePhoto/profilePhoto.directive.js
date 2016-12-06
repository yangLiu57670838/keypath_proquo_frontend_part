'use strict';

angular.module('digitalVillageApp')
  .directive('profilePhoto', function () {
    return {
      templateUrl: 'components/profilePhoto/profilePhoto.html',
      restrict: 'AE',
      scope: {
        profile: '=',
        uploadImage: '='
      },
      link: function (scope, element, attrs) {
      }
    };
  });
