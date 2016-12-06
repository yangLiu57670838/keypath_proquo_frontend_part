'use strict';

angular.module('digitalVillageApp')
  .factory('Review', function ($resource) {
    let reviews = $resource('/api/reviews/:id',
      {
        id: '@id'
      },
      {
        'update': {method: 'PUT'}
      });

    return reviews;
  });
