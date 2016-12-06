'use strict';

class TermsController {
  constructor(Auth, $state, $scope, $rootScope, $mdDialog,modalService) {
    this.Auth = Auth;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
  }


  close(){
    this.$mdDialog.hide();
  }

}

angular.module('digitalVillageApp')
  .controller('TermsController', TermsController);

