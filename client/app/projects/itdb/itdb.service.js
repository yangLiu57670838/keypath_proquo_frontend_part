'use strict';

angular.module('digitalVillageApp')
  .factory('itdbService', function ($resource, $http) {
    const resource = $resource('/api/invitationtodobusinesses/:id?action=:action',
      {
        id: '@id'
      },
      {
        update:             { method: 'PUT' },
        invokeAction:       { method: 'PUT', params: { action: '@action' }}
      }
    );

    resource.removeBusiness = function({ id, businessId }) {
      return $http({
        method: 'PUT',
        url : `/api/invitationtodobusinesses/${id}?action=removeBusiness&businessId=${businessId}`,
        headers: { 'Content-Type': 'application/json;charset=utf-8' }
      });
    };

    resource.delete = function({ id, reason }) {
      return $http({
        method: 'DELETE',
        url : `/api/invitationtodobusinesses/${id}`,
        data: {
          reason: reason
        },
        headers: { 'Content-Type': 'application/json;charset=utf-8' }
      });
    };

    resource.addBusinesses = function({ id, businessIds }) {
      return $http({
        method: 'PUT',
        url : `/api/invitationtodobusinesses/${id}?action=addBusinesses&businessIds=${businessIds}`,
        headers: { 'Content-Type': 'application/json;charset=utf-8' }
      });
    };

    resource.convertITDB = function({ id, businessId }) {
      return $http({
        method: 'PUT',
        url : `/api/invitationtodobusinesses/${id}?action=convert&businessId=${businessId}`,
        headers: { 'Content-Type': 'application/json;charset=utf-8' }
      });
    };

    return resource;
  });
