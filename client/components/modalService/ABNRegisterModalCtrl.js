'use strict';

angular.module('digitalVillageApp')
  .controller('ABNRegisterModalCtrl', function ($scope, $mdDialog, item, Business) {

    let self = this;
    self._Business = Business;
    self.$scope = $scope;
    self.item = item;
    self.$mdDialog = $mdDialog;
    self.business = item.business;
    self.cancel = function () {
      $mdDialog.cancel();
    };

    self.submit = function () {
      if (self.$scope.ABNForm.$invalid) {
        self.$scope.ABNForm.abn.$touched = true;
        self.$scope.ABNForm.$setSubmitted();
      } else {
        self._Business.update({ id: self.business._id }, self.business).$promise.then((result)=> {
          self.$mdDialog.hide(result);
        }, (response) => {
          this.serverErrors = response.data.errors;
        });
      }
    };

    self.cancel = function () {
      self.$mdDialog.cancel();
    };

  });
