'use strict';

angular.module('digitalVillageApp')
  .factory('RequestForQuote', function ($resource, $http) {
    const resource = $resource('/api/requestforquotes/:id?action=:action',
      {
        id: '@id'
      },
      {
        update:             { method: 'PUT' },
        invokeAction:       { method: 'PUT', params: { action: '@action' }},
        assignProject:      { method: 'PUT', params: { action: 'assignProject', sellerIds: "@sellerIds" }}
      }
    );

    resource.delete = function({ id, reason }) {
      return $http({
        method: 'DELETE',
        url : `/api/requestforquotes/${id}`,
        data: {
          reason: reason
        },
        headers: { 'Content-Type': 'application/json;charset=utf-8' }
      });
    };

    return resource;
  });
