'use strict';

describe('Controller: VideoLoaderControllerCtrl', function () {

  // load the controller's module
  beforeEach(module('digitalVillageApp'));

  let VideoLoaderControllerCtrl, scope;

  //Initialize the controller and a mock scope
  beforeEach(inject(($controller, $rootScope) => {
    scope = $rootScope.$new();
    VideoLoaderControllerCtrl = $controller('VideoLoaderControllerCtrl', {
      $scope: scope
    });
  }));

  it('should have controller initialized', () => {
    should.exist(VideoLoaderControllerCtrl);
  });
});
