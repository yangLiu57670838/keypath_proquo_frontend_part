'use strict';

angular.module('digitalVillageApp')
  .controller('GenericConfirmationModalCtrl', function ($scope, $mdDialog, item) {

    var self = this;
    self.item = item;
    self.confirmCallback = item.confirmCallback;
    self.confirmationMessage =  item.confirmationMessage;
    self.cancel = function() {
      $mdDialog.cancel();
    };

    self.confirm = function() {
      self.confirmCallback( item.id);
      $mdDialog.cancel();
    };
  });
