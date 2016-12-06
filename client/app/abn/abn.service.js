'use strict';

angular.module('digitalVillageApp')
  .factory('ABN', function ($resource) {
    return $resource('/api/abn/:abn');
  });
