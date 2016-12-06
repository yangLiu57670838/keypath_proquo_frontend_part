'use strict';

describe('Directive: editField', function () {

  // load the directive's module and view
  beforeEach(module('digitalVillageApp'));
  beforeEach(module('app/my/editField/editField.html', 'components/listReveal/listReveal.html'));

  let element, scope, template_place_holder;

  beforeEach(inject( ($compile, $rootScope) => {
    template_place_holder = '<edit-field decorated-value="decoratedValue" field-type="fieldType"></edit-field>';
    element = angular.element(template_place_holder);
    scope = $rootScope.$new();
    $compile(element)(scope);
    scope.$digest();
  }));

  it('should make hidden element visible', inject( () => {
    scope.$apply(() => {
      scope.toggle = false;
      scope.decoratedValue = 'test123';
      scope.fieldType = 'textfield';
    });

    let textElement = element.find('.edit-field span');
    should.equal((textElement.eq(0).hasClass('ng-hide')), false);
    should.equal(textElement.eq(0).text(), 'test123');
  }));
});
