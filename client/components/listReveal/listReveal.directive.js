'use strict';

angular.module('digitalVillageApp')
  .directive('listReveal', function ($timeout, $window) {
    return {
      templateUrl: 'components/listReveal/listReveal.html',
      restrict: 'E',
      transclude: true,
      scope:{
        minheight: "="
      },
      link: function (scope, element, attrs) {

        scope.calculateHeight = function(){
          scope.showToggle = false;
          scope.toggle = false;
          if(scope.minheight && scope.minheight>0){
            element.children('.reveal-container').css({'max-height':scope.minheight+'px'});
            $timeout(function(){
              var containerHeight = element.children('.reveal-container').height();
              var revealContent = element.children('.reveal-container').children('.reveal-content')[0].clientHeight;
              if((revealContent-5) > containerHeight){
                scope.showToggle = true;
              }
            });
          }
        };

        angular.element($window).bind('resize', function(){
          scope.calculateHeight();
        });
        scope.calculateHeight();
        scope.revealShow = function(){
          scope.toggle = !scope.toggle;
        };

      }
    };
  });
