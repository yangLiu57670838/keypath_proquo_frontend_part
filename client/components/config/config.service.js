'use strict';



angular.module('digitalVillageApp')
  .factory('Config', function ($q, $resource) {
    let conf = {
      res: $resource('/api/config/:id'),
      get(key) {
        let deferred = $q.defer();

        this.all().then(items => {
          deferred.resolve(_.find(items, {key: key}).val);
        }, deferred.reject);

        return deferred.promise;
      },
      all() {
        let deferred = $q.defer();

        if(this._confItems) {
          deferred.resolve(this._confItems);
        } else {
          this.res.query({}).$promise.then(co => {
            this._confItems = co;
            deferred.resolve(co);
          }, deferred.reject);
        }

        return deferred.promise;
      },
      _confItems: undefined
    };

    return conf;
  });
