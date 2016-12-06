'use strict';

describe('Directive: invitationToDoBusiness', function () {

  let StateChangeApprovalService, $httpBackend, $rootScope, $compile,  element;
  beforeEach(module('digitalVillageApp'));
  beforeEach(module('app/projects/itdb/itdb.html'));


  beforeEach(inject(($controller, _$rootScope_, _$httpBackend_, _$compile_, $injector, _StateChangeApprovalService_) => {
    $rootScope = _$rootScope_;
    $compile = _$compile_;
    $httpBackend = _$httpBackend_;
    StateChangeApprovalService = _StateChangeApprovalService_;
    $rootScope.mock_itdbs = {
      _id: '57c651cbf94c13bdf41de03d',
      acceptsCash: true,
      acceptsSwap: false,
      noTimeSpan: false,
      brief: {
        workTitle: 'Basic B2B app',
        description: 'A basic B2B application built MEAN'
      },
      estimatedDuration: 2,
      currentInvitees: [
        '56c50280e3ffd3a7abf8d0bf', // Another
        '56f50280e3ffd3a7aaf8d0bf' // Charlie
      ],
      formerInvitees: [
        { business: '89c50280e5ffd3a7aaf8d0bf', removedBy: 'seller' } // Alice
      ],
      userId: '56c50280e3ffd3a7aaf8d0be', // Fake
      collaborators: ['56c50280e3ffd3a7aaf8d0be', '87c50280e3ffd3a7aaf8d0bf', '8ac50280e6ffd3a7aaf8d0bf']
    };


    $httpBackend.when('GET', 'components/paginator/paginator.html').respond();
    $httpBackend.when('GET', 'app/projects/itdb/itdb.html').respond();
    $httpBackend.when('GET', 'components/collapsibleCard/collapsibleCard.html').respond();
    $httpBackend.when('GET', 'components/profileSummary/profileSummary.html').respond();
    $httpBackend.when('GET', 'components/profilePhoto/profilePhoto.html').respond();
    $httpBackend.when('GET', 'app/projects/itdb/itdbInviteeList.html').respond();
    $httpBackend.when('GET', '/assets/images/avatar.png').respond();
    $httpBackend.when('GET', '/assets/images/business_logo.png').respond();

    $httpBackend.when('GET', '/api/business/mine').respond();
    $httpBackend.when('GET', '/api/invitationtodobusinesses/?action=&fields=status&fields=_id&fields=brief.workTitle&fields=projects&filter=%7B%7D&pageNum=1&pageSize=20&populateWith=projects&populateWithFields=_id&populateWithFields=brief.supplierId&populateWithFields=log&populateWithFields=nameSpace&populateWithFields=status&populateWithFields=depositPayment&sort=updatedAt:desc').respond();
    $httpBackend.when('GET', '/api/invitationtodobusinesses').respond($rootScope.mock_itdbs);
    $httpBackend.when('GET', '/api/invitationtodobusinesses/57c651cbf94c13bdf41de03d?action=&fields=status&fields=_id&fields=brief.workTitle&fields=projects&filter=%7B%7D&pageNum=1&pageSize=20&populateWith=projects&populateWithFields=_id&populateWithFields=brief.supplierId&populateWithFields=log&populateWithFields=nameSpace&populateWithFields=status&populateWithFields=depositPayment&sort=updatedAt:desc').respond($rootScope.mock_itdbs[0]);
    $httpBackend.when('GET', '/api/invitationtodobusinesses/?action=').respond($rootScope.mock_itdbs);
    $httpBackend.when('GET', '/api/business?filter=%7B%22_id%22:%7B%22$in%22:%5B%2256c50280e3ffd3a7abf8d0bf%22,%2256f50280e3ffd3a7aaf8d0bf%22%5D%7D%7D').respond([{response:true}]);
    $httpBackend.when('DELETE', '/api/invitationtodobusinesses/57c651cbf94c13bdf41de03d').respond();
    $httpBackend.when('GET', '/api/business?filter=%7B%22userId%22:%2256c50280e3ffd3a7aaf8d0be%22%7D').respond([{result:true}]);


    element = $compile("<invitation-to-do-business model='mock_itdbs' on-delete='refresh()'></invitation-to-do-business>")($rootScope);
    $rootScope.$digest();
  }));


  it('should initialize the directive and show invitation to business', () => {
    const TestCtrl = element.controller("invitationToDoBusiness");
    TestCtrl.displayItdbInvite = true;
    const headingElement = element.find('.invitation-to-do-business');
    headingElement.length.should.equal(1);
  });


  it('should get the invitees if there are any', () => {
    const TestCtrl = element.controller('invitationToDoBusiness');
    TestCtrl.invitees = [];
    TestCtrl.getInviteeBusinesses();
    $httpBackend.flush();
    TestCtrl.invitees[0].response.should.equal(true);
  });

  it('should get the supplier businesses if there are any', () => {
    const TestCtrl = element.controller('invitationToDoBusiness');
    TestCtrl.getSupplierBusiness();
    $httpBackend.flush();
    TestCtrl.supplierBusiness.result.should.equal(true);
  });

  it('should call the refresh method after deleting an invite', () => {
    const TestCtrl = element.controller('invitationToDoBusiness');
    let isDeleted = false;
    TestCtrl.onDelete = function(){
      isDeleted = true;
    };
    TestCtrl._performDelete();
    $httpBackend.flush();
    isDeleted.should.equal(true);
  });
});
