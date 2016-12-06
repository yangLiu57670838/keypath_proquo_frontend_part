'use strict';

(function() {

function AuthService($location, $http, $cookies, $q, appConfig, Util, User, localStorageService, $rootScope) {
  var safeCb = Util.safeCb;
  var currentUser = {};
  var userRoles = appConfig.userRoles || [];

  if ($cookies.get('token') && $location.path() !== '/logout') {
    currentUser = User.get();
  }

  var Auth = {

    /**
     * Authenticate user and save token
     *
     * @param  {Object}   user     - login info
     * @param  {Function} callback - optional, function(error, user)
     * @return {Promise}
     */
    login({email, password}, callback) {
      return $http.post('/auth/local', {
        email: email,
        password: password
      })
        .then(res => {
          $cookies.put('token', res.data.token);
          currentUser = User.get();
          return currentUser.$promise;
        })
        .then(user => {
          $rootScope.$broadcast("login");
          safeCb(callback)(null, user);
          return user;
        })
        .catch(err => {
          Auth.logout();
          safeCb(callback)(err.data);
          return $q.reject(err.data);
        });
    },

    onLogin(callback) {
      $rootScope.$on("login", callback);
    },

    /**
     * Delete access token and user info
     */
    logout() {
      if (localStorageService.isSupported) {
        localStorageService.remove('toState');
      }
      $cookies.remove('token');
      currentUser = {};
      $rootScope.$broadcast("logout");
    },


    onLogout(callback) {
      $rootScope.$on("logout", callback);
    },

    /**
     * Create a new user
     *
     * @param  {Object}   user     - user info
     * @param  {Function} callback - optional, function(error, user)
     * @return {Promise}
     */
    createUser(user, callback) {
      return User.save(user,
        function(data) {
          $cookies.put('token', data.token);
          currentUser = User.get();
          $rootScope.$broadcast("newUser");
          return safeCb(callback)(null, user);
        },
        function(err) {
          Auth.logout();
          return safeCb(callback)(err);
        }).$promise;
    },

    onNewUser(callback) {
      $rootScope.$on("newUser", callback);
    },

    /**
     * Change password
     *
     * @param  {String}   oldPassword
     * @param  {String}   newPassword
     * @param  {Function} callback    - optional, function(error, user)
     * @return {Promise}
     */
    changePassword(oldPassword, newPassword, callback) {
      return User.changePassword({ id: currentUser._id }, {
        oldPassword: oldPassword,
        newPassword: newPassword
      }, function() {
        return safeCb(callback)(null);
      }, function(err) {
        return safeCb(callback)(err);
      }).$promise;
    },

    /**
     * Forgot password
     *
     * @param  {String}   email
     * @param  {Function} callback    - optional, function(error, user)
     * @return {Promise}
     */
    forgotPassword(email, callback) {
      return $http.post('/api/users/forgotPassword', {
          email: email
        })
        .then(() => {
          return safeCb(callback)(null);
        })
        .catch(err => {
          return safeCb(callback)(err);
        }).$promise;
    },

    /**
     * Reset password
     *
     * @param  {String}   newPassword
     * @param {String} userId
     * @param  {Function} callback    - optional, function(error, user)
     * @return {Promise}
     */
    resetPassword(newPassword, userId, callback) {
      return User.resetPassword({ id: userId }, {
        newPassword: newPassword
      }, function() {
        return safeCb(callback)(null);
      }, function(err) {
        return safeCb(callback)(err);
      }).$promise;
    },

    /**
     * Gets all available info on a user
     *   (synchronous|asynchronous)
     *
     * @param  {Function|*} callback - optional, funciton(user)
     * @return {Object|Promise}
     */
    getCurrentUser(callback) {
      if (arguments.length === 0) {
        return currentUser;
      }

      const userPromise = currentUser.hasOwnProperty('$promise') ? currentUser.$promise : $q.resolve(currentUser);
      return userPromise.then(user => {
          safeCb(callback)(user);
          return user;
        }, () => {
          safeCb(callback)({});
          return {};
        });
    },

    /**
     * Forces an update of `currentUser` from the server.
     *
     * @returns {Promise}
     */
    refresh() {
      currentUser = User.get();
      return currentUser.$promise; // callers can use this to confirm the refresh has completed
    },

    /**
     * Check if a user is logged in
     *   (synchronous|asynchronous)
     *
     * @param  {Function|*} callback - optional, function(is)
     * @return {Bool|Promise}
     */
    isLoggedIn(callback) {
      if (arguments.length === 0) {
        return currentUser.hasOwnProperty('roles');
      }

      return Auth.getCurrentUser(null)
        .then(user => {
          var is = user.hasOwnProperty('roles');
          safeCb(callback)(is);
          return is;
        });
    },

     /**
      * Check if a user has a specified role or higher
      *   (synchronous|asynchronous)
      *
      * @param  {String}     role     - the role to check against
      * @param  {Function|*} callback - optional, function(has)
      * @return {Bool|Promise}
      */
    hasRole(role, callback) {
      var hasRole = function(userRoles, requiredRole) {
        return userRoles.indexOf(requiredRole) > -1;
      };

      if (arguments.length < 2) {
        return hasRole(currentUser.roles, role);
      }

      return Auth.getCurrentUser(null)
        .then(user => {
          var has = (user.hasOwnProperty('roles')) ?
            hasRole(user.roles, role) : false;
          safeCb(callback)(has);
          return has;
        });
    },

     /**
      * Check if a user is an admin
      *   (synchronous|asynchronous)
      *
      * @param  {Function|*} callback - optional, function(is)
      * @return {Bool|Promise}
      */
    isAdmin() {
      return Auth.hasRole
        .apply(Auth, [].concat.apply(['admin'], arguments));
    },

    /**
     * Get auth token
     *
     * @return {String} - a token string used for authenticating
     */
    getToken() {
      return $cookies.get('token');
    },

    /**
     * Check if a user's email is verified/validated via social login or email link
     *
     * @param callback
     * @returns {Promise.<T>}
       */
    isEmailValidated(callback) {

      if (arguments.length === 0) {
        return currentUser.emailValidated;
      }

      return Auth.getCurrentUser(null)
        .then(user => {
          var is = user.emailValidated;
          safeCb(callback)(is);
          return is;
        });
    }
  };

  return Auth;
}

angular.module('digitalVillageApp.auth')
  .factory('Auth', AuthService);

})();
