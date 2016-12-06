'use strict';

angular.module('digitalVillageApp')
  .factory('Message', function ($resource) {
    return $resource('/api/messages/:id',
      {
        id: '@id'
      },
      {
        update: { method: 'PUT' }
      }
    );
  });
