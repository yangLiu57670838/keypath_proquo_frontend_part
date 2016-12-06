'use strict';

angular.module('digitalVillageApp')
  .controller('CancelInProgressConfirmCtrl', function ($scope, $window, $mdDialog, item) {

    var self = this;
    self.item = item;
    self.depositPaid = self.item.depositPaid;
    self.cancel = function() {
      $mdDialog.cancel();
    };

    self.confirm = function() {
      $window.location = "mailto:support@proquo.com.au"
      $mdDialog.cancel();
    };
  });
