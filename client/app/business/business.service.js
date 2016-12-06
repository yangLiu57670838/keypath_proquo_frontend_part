'use strict';

angular.module('digitalVillageApp')
  .factory('Business', function ($rootScope, $resource, $q) {

    let updateResponseInterceptor = {response: res => {
        if (res.status == 200) {
          $rootScope.$broadcast('businessUpdated');
        }
        return res.data;
      }
    };

    let bus = $resource('/api/business/:id',
      {
        id: '@id'
      },
      {
        update: {
          method: 'PUT',
          interceptor: updateResponseInterceptor
        },
        mine: {
          method: 'GET',
          params: {
            id: 'mine'
          }
        },
        updateMine: {
          method: 'PUT',
          interceptor: updateResponseInterceptor,
          params: {
            id: 'mine'
          }
        }
      });
    return bus;
  });
