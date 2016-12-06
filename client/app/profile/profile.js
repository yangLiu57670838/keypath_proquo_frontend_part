'use strict';

angular.module('digitalVillageApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('profileEdit', {
        url: '/profile/edit',
        templateUrl: 'app/profile/myprofile/myprofile.html',
        controller: 'MyprofileCtrl',
        controllerAs: 'myProfileCtrl',
        data: {
          pageTitle : 'My Profile'
        }
      })
      .state('profile', {
        url: '/profile/:profileId?distance&scrollToReviews',
        templateUrl: 'app/profile/profile.html',
        controller: 'ProfileCtrl',
        controllerAs: 'profileCtrl',
        data: {
          pageTitle : 'Profile'
        },
        params: {
          distance: null
        },
        onEnter: function($location, $anchorScroll, $stateParams, $timeout) {
          if($stateParams.scrollToReviews == "true") {
            $timeout(() => {
              $location.hash('community-reviews');
              $anchorScroll();

            }, 100);
          }
        }
      });
  });
