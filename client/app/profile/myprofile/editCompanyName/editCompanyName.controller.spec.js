'use strict';

describe('Controller: EditCompanyNameCtrl', function () {

  // load the controller's module
  beforeEach(module('digitalVillageApp'));

  let EditCompanyNameCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller, $rootScope) => {
    scope = $rootScope.$new();
    const item = {
      business: {
        urls: [{url: "www.facebook.com"}]
      }
    };
    EditCompanyNameCtrl = $controller('EditCompanyNameCtrl', {
      $scope: scope, item: item
    });
  }));

  it('should ...', () => {
    should.exist(EditCompanyNameCtrl);
  });
});
