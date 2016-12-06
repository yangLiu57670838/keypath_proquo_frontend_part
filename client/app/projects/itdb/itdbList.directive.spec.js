'use strict';

describe('Directive: itdbList directive', () => {

  let controller, StateChangeApprovalService, itdbservice, httpBackend, element, scope, template_place_holder, TestCtrl;
  const mock_itdbs =
    [
      {
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
      },
      {
        _id: '57c651cbf94c13bdf41de03e',
        acceptsCash: true,
        acceptsSwap: false,
        noTimeSpan: false,
        brief: {
          workTitle: 'Another ITDB',
          description: 'Another ITDB description'
        },
        estimatedDuration: 2,
        currentInvitees: ['56c50280e3ffd3a7aaf8d0bf'],  // Fake
        formerInvitees: [
          { business: '89c50280e5ffd3a7aaf8d0bf', removedBy: 'seller' } // Alice
        ],
        userId: '8ac50280e6ffd3a7aaf8d0bf', // Charlie
        collaborators: ['8ac50280e6ffd3a7aaf8d0bf', '87c50280e3ffd3a7aaf8d0bf']
      }
    ];
  beforeEach(module('digitalVillageApp'));
  beforeEach(module('app/projects/itdb/itdbList.html'));

  beforeEach(inject(($controller, $rootScope, $httpBackend, $compile, $injector, _StateChangeApprovalService_, _itdbService_) => {
    scope = $rootScope.$new();
    itdbservice = _itdbService_;
    httpBackend = $httpBackend;
    StateChangeApprovalService = _StateChangeApprovalService_;
    $httpBackend = $injector.get('$httpBackend');
    $httpBackend.when('GET', 'components/paginator/paginator.html').respond();
    $httpBackend.when('GET', 'app/projects/itdb/itdb.html').respond();
    $httpBackend.when('GET', 'components/collapsibleCard/collapsibleCard.html').respond();

    $httpBackend.when('GET', '/api/invitationtodobusinesses/?action=&fields=status&fields=_id&fields=brief.workTitle&fields=projects&filter=%7B%7D&pageNum=1&pageSize=20&populateWith=projects&populateWithFields=_id&populateWithFields=brief.supplierId&populateWithFields=log&populateWithFields=nameSpace&populateWithFields=status&populateWithFields=depositPayment&sort=updatedAt:desc').respond();

    $httpBackend.when('GET', '/api/invitationtodobusinesses').respond(mock_itdbs);
    $httpBackend.when('GET', '/api/invitationtodobusinesses/57c651cbf94c13bdf41de03d?action=&fields=status&fields=_id&fields=brief.workTitle&fields=projects&filter=%7B%7D&pageNum=1&pageSize=20&populateWith=projects&populateWithFields=_id&populateWithFields=brief.supplierId&populateWithFields=log&populateWithFields=nameSpace&populateWithFields=status&populateWithFields=depositPayment&sort=updatedAt:desc').respond(mock_itdbs[0]);

    $httpBackend.when('GET', '/api/invitationtodobusinesses/?action=').respond(mock_itdbs);

    template_place_holder = '<itdb-list></itdb-list>';
    element = angular.element(template_place_holder);

    $compile(element)(scope);
    scope.$digest();
    TestCtrl = element.controller('itdbList');
  }));

  it('should initialize the directive', () => {
    const headingElement = element.find('.itdb-list-heading');
    headingElement.length.should.equal(1);
  });

  it('should test the directive controller', () => {
    should.exist(TestCtrl);
  });

  it('should test the query service is called', inject(($httpBackend, _itdbService_) => {
    sinon.spy(_itdbService_, 'query');
    TestCtrl.refresh();
    $httpBackend.flush();
    scope.$digest();
    _itdbService_.query.calledOnce.should.equal(true);
    _itdbService_.query.firstCall.args[0].pageSize.should.equal(20);
  }));

  it('should test the query returns an expected response', (done) => {
    httpBackend.expectGET('/api/invitationtodobusinesses/?action=').respond(mock_itdbs);
    TestCtrl.response;
    itdbservice.query((res)=> {
      TestCtrl.response = res;
      done();
    });
    httpBackend.flush();
    TestCtrl.response._id.should.equal("57c651cbf94c13bdf41de03d");
  });

  it('should test the reposition method', () => {
    TestCtrl.getHash = function () {return "1111"};
    TestCtrl.itdbList = [{ _id: "1111" }, { _id: "2222" }];
    TestCtrl.itdbIdToOpen = "";
    TestCtrl.$location = {};
    TestCtrl.$location.hashNum = "12345";
    TestCtrl.$location.hash = function (hash) {TestCtrl.$location.hashNum = hash; };
    TestCtrl.reposition(TestCtrl.itdbList);
    scope.$digest();
    TestCtrl.$location.hashNum.should.equal("");
  });

});
