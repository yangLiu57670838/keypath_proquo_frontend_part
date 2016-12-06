'use strict';

describe('Controller: EditPortfolioCtrl', function () {

  // load the controller's module
  beforeEach(module('digitalVillageApp'));

  var EditPortfolioCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    EditPortfolioCtrl = $controller('EditPortfolioCtrl', {
      $scope: scope
    });
  }));

});
