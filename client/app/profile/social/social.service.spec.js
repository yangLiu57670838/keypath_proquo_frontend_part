'use strict';

describe('Service: social', function () {

  // load the service's module
  beforeEach(module('digitalVillageApp'));

  // instantiate service
  let social;
  beforeEach(inject((_Social_) => {
    social = _Social_;
  }));

  it('should do something', () => {
    should.equal(social.getSocialTypes().length, 7);
  });

});
