'use strict';

describe('Service: requestforquote resource', function () {
  let $httpBackend, RequestForQuote;

  beforeEach(module('digitalVillageApp'));

  beforeEach(inject((_$httpBackend_, _RequestForQuote_) => {
    $httpBackend = _$httpBackend_;
    RequestForQuote = _RequestForQuote_;
  }));

  describe('PUT', function () {
    it('should include offerToSupplier parameter', function () {
      $httpBackend.expect('PUT', '/api/requestforquotes/123?action=assignProject&offerToSupplier=false&sellerIds=456').respond();

      RequestForQuote.assignProject({
        id: '123',
        sellerIds: '456',
        offerToSupplier: false,
      }, {});

      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
    });
  });
});
