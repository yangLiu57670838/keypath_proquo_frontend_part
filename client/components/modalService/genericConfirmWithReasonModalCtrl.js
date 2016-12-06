'use strict';

angular.module('digitalVillageApp')
  .controller('GenericConfirmWithReasonModalCtrl', function ($scope, $mdDialog, item) {

    var self = this;
    self.item = item;
    self.project =  item.project;
    self.confirmCallback = item.confirmCallback;
    self.title = self.item.title;
    self.confirmationMessage = self.item.confirmationMessage;
    self.reason = "";
    self.cancel = function() {
      $mdDialog.cancel();
    };

    self.confirm = function() {
      self.confirmCallback(self.item.id, self.reason);
      $mdDialog.cancel();
    };
  });
