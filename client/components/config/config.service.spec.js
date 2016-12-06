'use strict';

describe('Service: config', function () {

  // load the service's module
  beforeEach(module('digitalVillageApp'));

  // instantiate service
  let config;

  beforeEach(inject((_Config_) => {
    config = _Config_;
  }));

  it('should do something', () => {
    should.exist(config);
  });

});
