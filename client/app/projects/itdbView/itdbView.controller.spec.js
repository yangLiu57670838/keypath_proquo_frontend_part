'use strict';

describe('Controller: ItdbViewCtrl', function () {

  // load the controller's module
  beforeEach(module('digitalVillageApp'));

  var ItdbViewCtrl, $scope, $rootScope, $itdbService, $httpBackend, $controller;

  // Initialize the controller and a mock scope
  beforeEach(inject((_$controller_, _$rootScope_, _$httpBackend_, _itdbService_) => {
    $rootScope = _$rootScope_;
    $controller = _$controller_;
    $itdbService = _itdbService_;
    $httpBackend = _$httpBackend_;
    $scope = $rootScope.$new();
    ItdbViewCtrl = $controller('ItdbViewCtrl', {
      $scope: $scope
    });

    ItdbViewCtrl.currentUser = { _id: "22222222222" }
    ItdbViewCtrl.itdb = {
      userId: "1111111111",
      brief: { budget: 200 },
      estimatedDuration: 1,
      noTimeSpan: true
    };
    $httpBackend.when('GET', '/api/invitationtodobusinesses/?action=').respond(ItdbViewCtrl.itdb);
    $httpBackend.when('GET', '/api/business?filter=%7B%22userId%22:%221111111111%22%7D').respond([{ userId: "22222" }]);
    $httpBackend.when('GET', '/api/business/mine').respond({ userId: "22222" });
    $rootScope.$digest();
  }));
  it('should test the duration text', () => {
    let result = ItdbViewCtrl.setDuration(null);
    result.should.equal("No timespan specified");
  });
  it('should test the duration text', () => {
    let result = ItdbViewCtrl.setDuration("< a week");
    result.should.equal("Less than a week");
  });
  it('should test the duration text', () => {
    let result = ItdbViewCtrl.setDuration("2 weeks");
    result.should.equal("In 2 weeks");
  });
  it('should test the duration text', () => {
    let result = ItdbViewCtrl.setDuration("4 weeks");
    result.should.equal("In 4 weeks");
  });
  it('should test the duration text', () => {
    let result = ItdbViewCtrl.setDuration("2 months");
    result.should.equal("In 2 months");
  });
  it('should test the duration text', () => {
    let result = ItdbViewCtrl.setDuration("3 months");
    result.should.equal("About 3 months");
  });
  it('should test the duration text', () => {
    let result = ItdbViewCtrl.setDuration("4 months");
    result.should.equal("About 4 months");
  });
  it('should test the duration text', () => {
    let result = ItdbViewCtrl.setDuration("5 months");
    result.should.equal("About 5 months");
  });
  it('should test the duration text', () => {
    let result = ItdbViewCtrl.setDuration("> 6 months");
    result.should.equal("Greater than 6 months");
  });

  it('should retrieve the invite', () => {
    ItdbViewCtrl.getItdb();
    $httpBackend.flush();
    ItdbViewCtrl.itdb.userId.should.equal("1111111111");
  });

  it('should retrieve instigatoer details', () => {
    ItdbViewCtrl.getInstigatorDetails();
    $httpBackend.flush();
    ItdbViewCtrl.business.userId.should.equal("22222");
  });

});
