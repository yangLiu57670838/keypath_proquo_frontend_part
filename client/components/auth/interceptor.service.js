'use strict';

(function() {

function authInterceptor($q, $cookies, $injector, Util) {
  var modalService;
  return {
    // Add authorization token to headers
    request(config) {
      config.headers = config.headers || {};
      if ($cookies.get('token') && Util.isSameOrigin(config.url)) {
        config.headers.Authorization = 'Bearer ' + $cookies.get('token');
      }
      return config;
    },

    // Intercept 401s and redirect you to login
    responseError(response) {
      if (response.status === 401) {
        if (!(modalService || (modalService = $injector.get('modalService'))).isLoginModalOpen()) {
          modalService.showLoginModal();
        }
        // remove any stale tokens
        $cookies.remove('token');
      }
      return $q.reject(response);
    }
  };
}

angular.module('digitalVillageApp.auth')
  .factory('authInterceptor', authInterceptor);

})();
