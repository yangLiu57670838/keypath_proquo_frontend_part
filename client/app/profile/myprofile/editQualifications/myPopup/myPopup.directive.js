'use strict';

angular.module('digitalVillageApp')
  .directive('myPopup', function ($document, $compile) {
    return {
      templateUrl: function(elem, attr){
        return attr.mytemplate+'.html';
      },
      restrict: 'EA',
      scope: {
        datamodel:"=",
        myheading:"="
      },
      controller: '@',
      controllerAs: 'vm',
      name:'ctrl',
      bindToController: true,
      link: function (scope, element, attrs) {

      }
    };
  });
