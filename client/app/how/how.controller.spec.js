'use strict';

describe('Controller: HowCtrl', function () {

  // load the controller's module
  beforeEach(module('digitalVillageApp'));

  let HowCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller, $rootScope) => {
    scope = $rootScope.$new();
    HowCtrl = $controller('HowCtrl', {
      $scope: scope
    });
  }));

  it('should have controller initialized', () => {
    should.exist(HowCtrl);
  });
});
