'use strict';

describe('Controller: SkillSearchController', function () {

  let SkillSearchCtrl, StateChangeApprovalService, scope;
  let angularElementStub;

  // load the service's module
  beforeEach(module('digitalVillageApp'));

  beforeEach(module(($provide) => {
    const auth = {
      getCurrentUser: () => {
        return { $promise: Promise.resolve({}) };
      },
      onLogin: () => {},
      onLogout: () => {},
      isLoggedIn: () => {}
    };
    $provide.value('Auth', auth);
  }));

  // Initialize the controller and a mock scope
  beforeEach(inject(($controller, $rootScope, _StateChangeApprovalService_, _Business_, _Auth_, _RequestForQuote_, _itdbService_) => {
    scope = $rootScope.$new();

    StateChangeApprovalService = _StateChangeApprovalService_;
    const myBusiness = { needs: [] };
    angularElementStub = sinon.stub(angular, 'element', ()=> {
      return [{}];
    });
    var currentUser = {};
    SkillSearchCtrl = $controller('SkillSearchController', { $scope: scope, Business: _Business_, myBusiness: myBusiness, currentUser });
    SkillSearchCtrl.Auth = _Auth_;
    SkillSearchCtrl.RequestForQuote = _RequestForQuote_;
    SkillSearchCtrl.itdbService = _itdbService_;
  }));

  afterEach(() => {
    angularElementStub.restore();
  });

  it('should the controller', () => {
    should.exist(SkillSearchController);
  });

  it('should check that chosenAssignees already contains the user Im trying to add ', () => {
    SkillSearchCtrl.offerProquoteFlag = true;
    SkillSearchCtrl.profileIdsAssigned = [];
    SkillSearchCtrl.chosenAssignees = [{_id: "234523452345"}];
    const userId= "234523452345";
    const res = SkillSearchCtrl.checkAssigned(userId);
    (res).should.equal(true);
  });


  it('should check that profileIdsAssigned already contains the user Im trying to add ', () => {
    SkillSearchCtrl.offerProquoteFlag = true;
    SkillSearchCtrl.profileIdsAssigned = ["234523452345"];
    SkillSearchCtrl.chosenAssignees = [];
    const userId= "234523452345";
    const res = SkillSearchCtrl.checkAssigned(userId);
    (res).should.equal(true);
  });

  it('should check that setAssignedNumber sets the number of people I have added ', () => {
    SkillSearchCtrl.offerProquoteFlag = true;
    SkillSearchCtrl.chosenAssignees = [{userId: "234523452345"}];
    SkillSearchCtrl.numAssigneesAllowed = 5;
    SkillSearchCtrl.setAssignedNumber();
    (SkillSearchCtrl.numberAssigned).should.equal(4);
  });

  it('should check that i can remove a user from my chosen stack of users ', () => {
    SkillSearchCtrl.offerProquoteFlag = true;
    const obj = {_id: "2222222"};
    SkillSearchCtrl.numAssigneesAllowed = 5;
    SkillSearchCtrl.numberAssigned = 2;
    SkillSearchCtrl.chosenAssignees = [{_id: "1111111"}, {_id: "2222222"}];
    SkillSearchCtrl.removeAssigned(obj);
    (SkillSearchCtrl.numberAssigned).should.equal(4);
    (SkillSearchCtrl.chosenAssignees.length).should.equal(1);
  });

  it('should assign the number of users assigned to the proquote ', () => {
    SkillSearchCtrl.offerProquoteFlag = true;
    const self = SkillSearchCtrl;
    SkillSearchCtrl.currentUser = {_id:"3333333"};
    SkillSearchCtrl.profileIdsAssigned = [];
    const proquote = [
      {
        projects: [
          {
            brief: {
              supplierId: "22222222"
            }
          },
          {
            brief: {
              supplierId: "11111111"
            }
          }
        ]
      }
    ];
    SkillSearchCtrl.setAlreadyAssigned(proquote);
    (SkillSearchCtrl.profileIdsAssigned.length).should.equal(2);
  });
});
