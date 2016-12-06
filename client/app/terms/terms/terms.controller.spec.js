'use strict';

describe('Controller: TermsCtrl', function () {

  // load the controller's module
  beforeEach(module('digitalVillageApp'));

  let TermsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller, $rootScope) => {
    scope = $rootScope.$new();
    TermsCtrl = $controller('TermsCtrl', {
      $scope: scope
    });
  }));

  it('should have controller initialized', () => {
    should.exist(TermsCtrl);
  });
});
