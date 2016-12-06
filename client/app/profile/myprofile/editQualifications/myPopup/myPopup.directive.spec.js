'use strict';

describe('Directive: myPopup', function () {

  // load the directive's module and view
  beforeEach(module('digitalVillageApp'));
  beforeEach(module('app/profile/myprofile/editQualifications/editQualifications.html'));

  let element, scope, template_place_holder, directiveController;

  beforeEach(inject(($compile, $rootScope) => {
    template_place_holder = '<my-popup mytemplate="app/profile/myprofile/editQualifications/editQualifications" ctrl="EditQualificationsCtrl"></my-popup>';
    element = angular.element(template_place_holder);
    scope = $rootScope.$new();
    $compile(element)(scope);
    scope.$digest();
    directiveController = element.controller('ctrl');
  }));

  it('should hide element when there are more than two qualifications ', inject(() => {
    scope.$apply(() => {
      directiveController.qualifications = ['1', '2', '3'];
    });
    const contentElement = element.find('md-dialog-content div div');
    should.equal(contentElement.eq(0).hasClass('ng-hide'), true);
  }));
});
