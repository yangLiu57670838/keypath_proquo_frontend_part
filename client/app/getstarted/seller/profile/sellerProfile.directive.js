'use strict';

angular.module('digitalVillageApp')
  .directive('sellerProfile', function () {
    return {
      controller: MyProfileController,
      controllerAs: 'vm',
      templateUrl: 'app/getstarted/seller/profile/sellerProfile.template.html',
      restrict: 'E',
      bindToController: {
        business: "=profileModel",
      },
      scope: {
        profileFormValid: '='
      },
      link: scope => {
        scope.$watch('vm.$scope.profileForm.$valid', () => {
          scope.profileFormValid = scope.vm.$scope.profileForm && scope.vm.$scope.profileForm.$valid;
        });
      }
    };
  });
