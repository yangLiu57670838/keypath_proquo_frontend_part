'use strict';

describe('Directive: mySave', function () {

  // load the directive's module
  beforeEach(module('digitalVillageApp'));

  let element, scope, template_place_holder;

  beforeEach(inject(($rootScope, $compile) => {
    template_place_holder = '<my-save></my-save>';
    element = angular.element(template_place_holder);
    scope = $rootScope.$new();
    $compile(element)(scope);
    scope.$digest();
  }));

  it('should make hidden element visible', inject(() => {
    should.equal(element.length, 1);
  }));
});
