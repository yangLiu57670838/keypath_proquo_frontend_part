'use strict';

describe('Controller: EditUrlCtrl', function () {

  // load the controller's module
  beforeEach(module('digitalVillageApp'));

  let EditUrlCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller, $rootScope) => {
    scope = $rootScope.$new();
    const item = {
      business: {
        socialUrls: [{ url: "www.facebook.com" }]
      }
    };
    EditUrlCtrl = $controller('EditUrlCtrl', {
      $scope: scope, item: item
    });
  }));

  it('should ...', () => {
    should.exist(EditUrlCtrl)
  });
});
