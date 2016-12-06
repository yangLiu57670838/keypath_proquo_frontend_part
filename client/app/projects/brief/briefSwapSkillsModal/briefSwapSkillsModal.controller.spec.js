'use strict';

describe('Controller: BriefSwapSkillsModalCtrl', function () {

  // load the controller's module
  beforeEach(module('digitalVillageApp'));

  let BriefSwapSkillsModalCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller, $rootScope) => {
    scope = $rootScope.$new();
    const businessSwapItems = [];
    const project = {};
    const business = {};
    BriefSwapSkillsModalCtrl = $controller('BriefSwapSkillsModalCtrl', {
      $scope: scope, businessSwapItems: businessSwapItems, project: project, business: business
    });
  }));

  it('should ...', () => {
    should.exist(BriefSwapSkillsModalCtrl);
  });
});
