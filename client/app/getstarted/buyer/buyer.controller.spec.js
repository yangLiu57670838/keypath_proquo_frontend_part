'use strict';

describe('Controller: GetStartedBuyerCtrl', function () {

  let BuyerCtrl, StateChangeApprovalService, scope;
  let angularElementStub;

  beforeEach(module('digitalVillageApp'));

  beforeEach(module(($provide) => {
    const auth = {
      getCurrentUser: () => {
        return { $promise: Promise.resolve({}) };
      },
      onLogin: () => {},
      onLogout: () => {}
    };
    $provide.value('Auth', auth);
  }));

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller, $rootScope, _StateChangeApprovalService_, _Business_) => {
    scope = $rootScope.$new();
    StateChangeApprovalService = _StateChangeApprovalService_;
    const myBusiness = { needs: [] };

    angularElementStub = sinon.stub(angular, 'element', ()=> {
      return [{}];
    });
    BuyerCtrl = $controller('GetStartedBuyerCtrl', { $scope: scope, Business: _Business_, myBusiness: myBusiness });
  }));

  afterEach(() => {
    angularElementStub.restore();
  });

  it('should have controller initialized', () => {
    should.exist(BuyerCtrl);
  });
});
