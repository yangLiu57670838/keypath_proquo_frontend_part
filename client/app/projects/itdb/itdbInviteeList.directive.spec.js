'use strict';

describe('Directive: itdbInviteeList', () => {
  let element, scope, template_place_holder;

  beforeEach(module('digitalVillageApp'));
  beforeEach(module('app/projects/itdb/itdbInviteeList.html', 'components/profileSummary/profileSummary.html',
    'components/profilePhoto/profilePhoto.html'));

  beforeEach(inject(($rootScope, $httpBackend, $compile, $injector) => {
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('PUT', '/api/invitationtodobusinesses/57c651cbf94c13bdf41de03d?action=removeBusiness&businessId=56c50280e3ffd3a7abf8d0bf').respond();
    $httpBackend.when('GET', '/assets/images/avatar.png');
    $httpBackend.when('GET', '/assets/images/business_logo.png');

    scope = $rootScope.$new();
    scope.invitees = [{ _id: "56c50280e3ffd3a7abf8d0bf" }, { _id: "56f50280e3ffd3a7aaf8d0bf" }];
    scope.itdb_id = '57c651cbf94c13bdf41de03d';
    template_place_holder = "<itdb-invitee-list invitees='invitees' itdb-id='itdb_id'></itdb-invitee-list>";
    element = angular.element(template_place_holder);

    $compile(element)(scope);
    scope.$digest();
  }));

  it('should initialize the directive and show two invitees', (() => {
    const headingElement = element.find('.invitee-info');
    headingElement.length.should.equal(2);
  }));

  it('should remove selected invitee from the list and call correct endpoint for removing', inject(($httpBackend, _itdbService_) => {
    const itdbInviteeListCtrl = element.controller('itdbInviteeList');
    sinon.spy(_itdbService_, 'removeBusiness');
    let removedInvitee = scope.invitees[0];
    itdbInviteeListCtrl._performDelete(removedInvitee);
    $httpBackend.flush();
    scope.$digest();
    const headingElement = element.find('.invitee-info');
    headingElement.length.should.equal(1);
    _itdbService_.removeBusiness.calledOnce.should.equal(true);
    _itdbService_.removeBusiness.getCall(0).args[0].businessId.should.equal('56c50280e3ffd3a7abf8d0bf');
    _itdbService_.removeBusiness.getCall(0).args[0].id.should.equal('57c651cbf94c13bdf41de03d');
  }));

  it('should check modal is called', inject(($httpBackend, _itdbService_, _modalService_) => {
    let modal = '<md-dialog> </md-dialog>';
    var removedInvitee = {_id:"1234"};
    $httpBackend.when('GET', 'components/modalService/genericConfirmationModal.html').respond(modal);

    const itdbInviteeListCtrl = element.controller('itdbInviteeList');
    itdbInviteeListCtrl.modalService = _modalService_;

    sinon.spy(itdbInviteeListCtrl.modalService, 'showGenericConfirmModal');

    itdbInviteeListCtrl.removeInvitee(removedInvitee);
    $httpBackend.flush();
    scope.$digest();
    itdbInviteeListCtrl.modalService.showGenericConfirmModal.calledOnce.should.equal(true);
    itdbInviteeListCtrl.modalService.showGenericConfirmModal.restore();


  }));


});
