'use strict';

angular.module('digitalVillageApp')
  .directive('mySave', function () {
    return {
      restrict: 'EA',
      scope:{
        itemTowatch:"=",
        theModel:"=",
        callback:"="
      },
      link: function (scope, element, attrs) {
        scope.$watch('itemTowatch', function(newVal, oldVal){
          if(oldVal === undefined && newVal === undefined){
            //prevent callback / save
          }else{
            if(newVal != undefined && newVal != oldVal && Date.parse(newVal) != Date.parse(scope.theModel.businessEstablished) ){
              scope.theModel.businessEstablished = scope.itemTowatch;
              var objectToUpdate = {id: scope.theModel._id, businessEstablished:scope.theModel.businessEstablished};
              scope.callback(objectToUpdate);
            }
          }

        });
      }
    };
  });
