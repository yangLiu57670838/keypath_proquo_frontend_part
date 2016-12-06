'use strict';

class CollapsibleCardController {
  constructor ($rootScope, $scope) {
    this.rootScope = $rootScope;
    this.scope = $scope;
    this.cardHeaderTitle = $scope.cardHeaderTitle;
  }

  emitEvent(cardId, showDetails) {
    this.rootScope.$broadcast('collapsibleCardChanged', {cardId: cardId, showDetails: showDetails});
  }
}

angular.module('digitalVillageApp')
  .directive('collapsibleCard', function () {
    return {
      controller: CollapsibleCardController,
      controllerAs: 'collapsibleCardCtrl',
      templateUrl: 'components/collapsibleCard/collapsibleCard.html',
      restrict: 'E',
      scope: true,
      transclude: true,
      link: function (scope, element, attrs, controller, transclude) {
        scope.cardId = attrs.cardId;
        scope.showDetails = false;

        if (attrs.expandCard && attrs.expandCard != 'true' && attrs.expandCard != 'false') {
          scope.showDetails = attrs.expandCard.split('.').reduce(function(a, b) {
            return a[b];
          }, scope.$parent);
        } else {
          scope.showDetails = attrs.expandCard=='true' || false;
        }

        transclude(scope, function(clone, scope) {
          Array.prototype.forEach.call(clone, function(node) {
            if (! node.tagName) {
              return;
            }
            // look for a placeholder node in the template that matches the tag in the multi-transcluded content
            var placeholder = element[0].querySelector('.' + node.tagName.toLowerCase());
            if (! placeholder) {
              return;
            }
            // insert the transcluded content
            placeholder.appendChild(node);
          });
        });
      }
    };
  });
