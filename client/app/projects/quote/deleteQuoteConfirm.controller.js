'use strict';

angular.module('digitalVillageApp')
  .controller('DeleteQuoteConfirmCtrl', function ($scope, $mdDialog, item) {

    var self = this;
    self.item = item;
    self.project =  item.project;
    self.confirmCallback = item.confirmCallback;
    self.recipientName = self.item.recipientName;
    this.message = "";
    self.cancel = function() {
      $mdDialog.cancel();
    };

    self.confirm = function() {
      self.confirmCallback(this.message);
      $mdDialog.cancel();
    };
  });
