'use strict';

describe('Service: document', function () {

  // load the service's module
  beforeEach(module('digitalVillageApp'));

  // instantiate service
  let document;

  beforeEach(inject((_Document_) => {
    document = _Document_;
  }));

  it('should do something', () => {
    should.exist(document);
  });

});
