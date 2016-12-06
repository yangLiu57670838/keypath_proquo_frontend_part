'use strict';


angular.module('digitalVillageApp')
  .service('CategoriesService', ["$http", "$q",
    function keywordService($http, $q) {
      var self = this;

      self.getKeywordCategoryMap = function(){
        var deferred = $q.defer();

        $http.get('/api/categories?pageNum=1&pageSize=200').then(function(response){
          deferred.resolve(response.data);
        }, function(reason){
          console.error('keyword service error when trying to get skills keywords category map');
          deferred.reject(reason);
        });

        return deferred.promise;
      };

    }]);
