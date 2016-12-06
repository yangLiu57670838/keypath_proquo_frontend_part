'use strict';

describe('Controller: EditQualificationsCtrl', function () {

  // load the controller's module
  beforeEach(module('digitalVillageApp'));

  let EditQualificationsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller, $rootScope) => {
    scope = $rootScope.$new();
    EditQualificationsCtrl = $controller('EditQualificationsCtrl', {
      $scope: scope
    });
  }));

  it('should have controller initialized', () => {
    should.exist(EditQualificationsCtrl);
  });
});
