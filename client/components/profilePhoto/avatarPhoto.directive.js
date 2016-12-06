'use strict';

angular.module('digitalVillageApp')
  .directive('avatarPhoto', function () {
    return {
      templateUrl: 'components/profilePhoto/avatarPhoto.html',
      restrict: 'AE',
      scope: {
        profile: '='
      },
      link: function (scope, element, attrs) {
      }
    };
  });
