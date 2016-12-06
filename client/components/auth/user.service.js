'use strict';

(function() {

function UserResource($resource) {
  return $resource('/api/users/:id/:controller', {
    id: '@_id'
  }, {
    changePassword: {
      method: 'PUT',
      params: {
        controller: 'password'
      }
    },
    get: {
      method: 'GET',
      params: {
        id: 'me'
      }
    },
    resetPassword: {
      method: 'PUT',
      params: {
        controller: 'resetPassword'
      }
    },
    addName : {
      method: 'PUT',
      params: {
        controller: 'addName'
      }
    },
    verifyBillingState : {
      method: 'PUT',
      params: {
        id: 'verifyBillingState'
      }
    },
    validationEmail: {
      method: 'POST',
      params: {
        controller: 'validationEmail'
      }
    }
  }

);
}
  function UserTokenResource($resource) {
    return $resource('/api/users/:token/validateEmail', {
      token: '@token'
    },
    {
      validateEmail: {
        method: 'PUT'
      }
    });
  }

angular.module('digitalVillageApp.auth')
  .factory('User', UserResource)
  .factory('UserToken', UserTokenResource);

})();
