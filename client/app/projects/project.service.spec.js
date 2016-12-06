'use strict';

describe('Service: project', function () {

  // load the service's module
  beforeEach(module('digitalVillageApp'));

  // instantiate service
  let project;
  beforeEach(inject((_Project_) => {
    project = _Project_;
  }));

  it('should do something', () => {
    should.exist(project);
  });

});
