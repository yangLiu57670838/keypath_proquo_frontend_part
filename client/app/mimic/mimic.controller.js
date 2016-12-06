'use strict';

/**
 * Much work required. This is some hacky code to proof a concept / approach.
 */
angular.module('digitalVillageApp')
  .controller('MimicCtrl', function ($scope, User, Auth, $http, $window) {
    $scope.search = {};

    $scope.refresh = function() {
      Auth.getCurrentUser(user => {
        $scope.currentUser = user;
        if ($scope.currentUser.originalUserId) {
          $scope.currentUser.mimic = true;
        }

        if(!$scope.currentUser.mimic) {
          User.query({
            pageNum: 1,
            pageSize: 5,
            searchText: $scope.search.text
          }).$promise.then(users => {
              users.forEach(usr => {
                usr.mimic = false;

                // Don't display current user or the user they are mimicing
                if (usr._id == $scope.currentUser._id || usr._id == $scope.currentUser.originalId) {
                  usr.hide = true;
                } else {
                  usr.hide = false;
                }
              });

              $scope.users = users;
            });
        } else {
          $scope.users = [];
        }
      });
    };

    $scope.stopMimicing = function() {
      $http.put('/api/mimic')
        .then(x => {$window.location.reload();});
    };


    $scope.startMimicing = function(userId) {
      $http.post('/api/mimic/' + userId)
        .then(x => {$window.location.reload();});
    };

    $scope.refresh();
  });
