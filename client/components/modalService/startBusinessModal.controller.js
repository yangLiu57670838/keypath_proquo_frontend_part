'use strict';

class StartBusinessModalCtrl {
  constructor($mdDialog, $state) {
    this._$mdDialog = $mdDialog;
    this._$state = $state;
  }

  createITDB = function () {
    this._$mdDialog.hide();
    this._$state.go('createItdb')
  };

  createProquote = function () {
    this._$mdDialog.hide();
    this._$state.go('briefCreate', {proquote: true})
  };
}

angular.module('digitalVillageApp')
  .controller('StartBusinessModalCtrl', StartBusinessModalCtrl);

