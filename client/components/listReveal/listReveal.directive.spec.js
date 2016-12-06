'use strict';

describe('Directive: listReveal', function () {

  // load the directive's module and view
  beforeEach(module('digitalVillageApp'));
  beforeEach(module('components/listReveal/listReveal.html'));

  let template_place_holder, element, scope;

  beforeEach(inject(($rootScope, $compile) => {
    template_place_holder = '<list-reveal minheight="minheight"></list-reveal>';
    element = angular.element(template_place_holder);

    scope = $rootScope.$new();
    scope.minheight = 200;
    $compile(element)(scope);
    scope.$digest();

  }));

  it('should make hidden element visible', inject(() => {
    const container = element.find('.reveal-container');
    should.equal(container.css('max-height'), '200px');
  }));
});
